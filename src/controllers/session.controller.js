const Session = require("../models/Sessions");
const appError = require("../utils/handelError.js");
const User = require("../models/Users.js");
const Question = require("../models/Questions.js");
const Answer = require("../models/Answers.js");
const { generateAIResponse } = require("../utils/aiService.js");
const { buildSessionAnalysisPrompt } = require("../utils/aiPrompts.js");
const { softSkillsRecommendations } = require("../utils/softSkillsRecommendations.js");


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
        if (!sessions) {
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
        if (!sessionQuestions) {
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
        session.score = aiFullSessionEvaluation.score;
        session.aiEvaluation.clarity = aiFullSessionEvaluation.aiEvaluation.clarity;
        session.aiEvaluation.confidence = aiFullSessionEvaluation.aiEvaluation.confidence;
        session.aiEvaluation.relevance = aiFullSessionEvaluation.aiEvaluation.relevance;
        session.aiEvaluation.organization = aiFullSessionEvaluation.aiEvaluation.organization;
        session.aiEvaluation.engagement = aiFullSessionEvaluation.aiEvaluation.engagement;
        session.strengths = aiFullSessionEvaluation.strengths;
        session.improvements = aiFullSessionEvaluation.improvements;
        const durationMinutes = Math.floor(
        (Date.now() - session.createdAt.getTime()) / 60000);
        session.endedAt = new Date();
        session.durationMinutes = durationMinutes;
        session.softSkillsRecommendations = recommendations;
        session.ended = true;
        await session.save();
        await User.findByIdAndUpdate(req.currentUser.id, {$inc: {totalTrainingMinutes: durationMinutes}});
        res.status(200).json({ status: "SUCCESS", data: session });
    } catch (error) {
        return next(
            appError.create("حدث خطأ أثناء عملية إنهاء الجلسة", 500, false)
        );
    }
};







module.exports = {
    createSession,
    getUserSessions,
    endSession
}