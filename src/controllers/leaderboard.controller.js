const appError = require("../utils/handelError.js");
const User = require("../models/Users.js");

const leaderBoardInformation = async (req, res, next) => {
    try {
        const topUsers = await User.find({ numberOfSessions: { $gte: 10 } }).select("fullname averageScore numberOfSessions").sort({ averageScore: -1 }).limit(10).lean();
        if (!topUsers.length) {
            return next(
                appError.create("لا يوجد مستخدمين مميزين", 400, false)
            );
        }
        res.status(200).json({ status: "SUCCESS", data: topUsers });
    } catch (error) {
        return next(appError.create("حدث خطأ أثناء عملية جلب أفضل المستخدمين, يرجى المحاولة مرة أخرى", 500, false));
    }
};

module.exports = {
    leaderBoardInformation
};