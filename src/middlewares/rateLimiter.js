const rateLimit = require("express-rate-limit");

// عام لكل auth APIs
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // 100 طلب لكل IP
    message: {
        status: false,
        message: "عدد طلبات كبير جداً، حاول لاحقاً"
    }
});

// حساس جداً → OTP
exports.otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 دقائق
    max: 5, // فقط 5 محاولات
    message: {
        status: false,
        message: "طلبات كثيرة لرمز التحقق، حاول لاحقاً"
    }
});

// ─── جديد: APIs التي تستهلك AI (مكلفة على السيرفر) ───
exports.aiLimiter = rateLimit({
    windowMs: 60 * 1000,        // دقيقة واحدة
    max: 30,                    // 30 طلب فقط
    message: { status: false, message: "طلبات كثيرة جداً، حاول بعد دقيقة" }
});

// ─── جديد: APIs العادية (dashboard, leaderboard) ───
exports.generalLimiter = rateLimit({
    windowMs: 60 * 1000,        // دقيقة واحدة
    max: 100,                   // 100 طلب
    message: { status: false, message: "عدد طلبات كبير جداً، حاول لاحقاً" }
});