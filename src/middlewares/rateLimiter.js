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