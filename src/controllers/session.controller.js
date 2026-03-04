const Session = require("../models/Sessions");
const appError = require("../utils/handelError.js");


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









module.exports = {
    createSession,
    getUserSessions
}