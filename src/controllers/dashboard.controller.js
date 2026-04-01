const Session = require("../models/Sessions");
const appError = require("../utils/handelError.js");
const User = require("../models/Users.js");

const getUserDashboardData = async (req, res, next) => {
    try {
        const user = await User.findById(req.currentUser.id);
        if (!user) {
            return next(
                appError.create("المستخدم غير موجود", 400, false)
            );
        }
        const userSessions = await Session.find({ userId: req.currentUser.id });
        if (!userSessions.length) {
            return next(
                appError.create("لا يوجد جلسات لهذا المستخدم", 400, false)
            );
        }
        const bestSessionScore = Math.max(...userSessions.map((userSession) => userSession.score));
        const improvmentRate = userSessions[userSessions.length - 1].score - userSessions[0].score;
        const latestUserSession = userSessions[userSessions.length - 1];
        const userData = { numberOfSessions: user.numberOfSessions, averageScore: user.averageScore, totalTrainingMinutes: user.totalTrainingMinutes, bestSessionScore: bestSessionScore, improvmentRate: improvmentRate, latestUserSession: latestUserSession };
        res.status(200).json({ status: "SUCCESS", data: userData });
    } catch (error) {
        return next(appError.create("حدث خطأ أثناء عملية جلب البيانات, يرجى إعادة المحاولة", 500, false));
    }
};


module.exports = {
    getUserDashboardData
};