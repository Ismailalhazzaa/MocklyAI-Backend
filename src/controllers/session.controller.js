const Session = require("../models/Sessions");
const appError = require("../utils/handelError.js");
const User = require("../models/Users.js");
const Question = require("../models/Questions.js");
const Answer = require("../models/Answers.js");
const { generateAIResponse } = require("../utils/aiService.js");
const { buildSessionAnalysisPrompt } = require("../utils/aiPrompts.js");
const { softSkillsRecommendations } = require("../utils/softSkillsRecommendations.js");
const path = require('path');
const fs = require("fs");
const XLSX = require('xlsx');

const createSession = async (req, res, next) => {
    try {
        const { specialization, numberOfQuestions, questionTypes, difficultyLevel } = req.body;
        if (!specialization?.trim()) {
            return next(
                appError.create("يرجى إدخال التخصص", 400, false)
            );
        }
        if (!questionTypes) {
            return next(
                appError.create("يرجى تحديد نوع الإجابة", 400, false)
            );
        }
        const session = await Session.create({ userId: req.currentUser.id, specialization: specialization, numberOfQuestions: numberOfQuestions, questionTypes: questionTypes, difficultyLevel: difficultyLevel });
        const user = await User.findByIdAndUpdate(req.currentUser.id, { $inc: { numberOfSessions: 1 } });
        res.status(201).json({ status: "SUCCESS", data: "تم إنشاء الجلسة بنجاح", sessionId: session._id });
    } catch (error) {
        return next(
            appError.create("حدث خطأ أثناء عملية إنشاء الجلسة", 500, false)
        );
    }
};

const getUserSessions = async (req, res, next) => {
    try {
        const limit = req.query.limit || 5;
        const page = req.query.page || 1;
        const skip = (page - 1) * limit;
        const sessions = await Session.find({ userId: req.currentUser.id }).limit(limit).skip(skip);
        if (!sessions.length) {
            return next(
                appError.create("لا يوجد أي جلسات سابقة لعرضها", 400, false)
            );
        }
        res.status(200).json({ status: "SUCCESS", data: sessions });
    } catch (error) {
        return next(
            appError.create("حدث خطأ أثناء عملية عرض الجلسات, يرجى إعادة المحاولة", 500, false)
        );
    }
};

const endSession = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const session = await Session.findById(sessionId);
        if (!session) {
            return next(appError.create("الجلسة غير موجودة", 400, false));
        }
        if (session.ended === true) {
            return next(appError.create("الجلسة انتهت و تم تقييمها بالفعل", 400, false));
        }
        const sessionQuestions = await Question.find({ sessionId: sessionId });
        if (!sessionQuestions.length) {
            return next(appError.create("لا يوجد أسئلة في هذه الجلسة", 400, false));
        }
        const questionIds = sessionQuestions.map(q => q._id);
        const answers = await Answer.find({ questionId: { $in: questionIds } });
        const questionsWithAnswersForEvaluation = sessionQuestions.map(q => {
            const answer = answers.find(a => a.questionId.toString() === q._id.toString());
            return {
                question: q.questionText,
                answer: answer.textAnswer
            };
        });
        const prompt = buildSessionAnalysisPrompt(questionsWithAnswersForEvaluation);
        const aiFullSessionEvaluation = await generateAIResponse(prompt);
        const recommendations = softSkillsRecommendations(aiFullSessionEvaluation);
        const durationMinutes = Math.floor(
            (Date.now() - session.createdAt.getTime()) / 60000
        );
        session.set({
            score: aiFullSessionEvaluation.score,
            aiEvaluation: { ...aiFullSessionEvaluation.aiEvaluation },
            strengths: aiFullSessionEvaluation.strengths,
            improvements: aiFullSessionEvaluation.improvements,
            softSkillsRecommendations: recommendations,
            endedAt: new Date(),
            durationMinutes,
            ended: true
        });
        const user = await User.findById(req.currentUser.id);
        const newAverageScore = Math.round(
            ((user.averageScore * user.numberOfSessions) + aiFullSessionEvaluation.score) / (user.numberOfSessions)
        );
        await session.save();
        await User.findByIdAndUpdate(req.currentUser.id, {
            $inc: {
                totalTrainingMinutes: durationMinutes,
            },
            averageScore: newAverageScore
        });
        res.status(200).json({ status: "SUCCESS", data: session });
    } catch (error) {
        return next(
            appError.create("حدث خطأ أثناء عملية إنهاء الجلسة", 500, false)
        );
    }
};

const exportUserStatistic = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: false, message: 'المستخدم غير موجود' });
        }

        const data = [{
            'معرف المستخدم': user.id,
            'اسم المستخدم': user.fullname, // تضمين اسم المستخدم
            'عدد الجلسات المنفذة': user.numberOfSessions,
            'عدد الدقائق التدريبية': user.totalTrainingMinutes,
            'متوسط التقييمات في كل الجلسات': user.averageScore,
        }];

        // إنشاء ملف Excel وتحسين تنسيق الجدول
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data, {
            header: ['معرف المستخدم', 'اسم المستخدم', 'عدد الجلسات المنفذة', 'عدد الدقائق التدريبية', 'متوسط التقييمات في كل الجلسات'],
            skipHeader: false
        });

        // تحسين عرض الجدول
        worksheet['!cols'] = [
            { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
        ];

        // إضافة الورقة إلى الملف
        XLSX.utils.book_append_sheet(workbook, worksheet, 'إحصائيات المتسخدم');

        // تحديد المسار الصحيح لحفظ الملف
        const filePath = path.join(__dirname, `./user_statistics_${user.fullname}.xlsx`);
        XLSX.writeFile(workbook, filePath);

        // إرسال الملف للتحميل
        res.download(filePath, `user_statistics_${user.fullname}.xlsx`, (err) => {
            if (err) {
            return next(new Error('حدث خطأ أثناء تحميل الملف'));
            }
            setTimeout(() => {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('خطأ أثناء حذف الملف:', unlinkErr);
            });
            }, 5000);
        });

    } catch (error) {
        return next(new Error(error.message));
    }
};



module.exports = {
    createSession,
    getUserSessions,
    endSession,
    exportUserStatistic
}