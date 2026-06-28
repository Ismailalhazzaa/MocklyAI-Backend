const rateLimit = require("express-rate-limit");

const keyGenerator = (req) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    return ip.split(':')[0]; // يحذف الـ port ويأخذ الـ IP فقط
};

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator,
    message: {
        status: false,
        message: "عدد طلبات كبير جداً، حاول لاحقاً"
    }
});

exports.otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    keyGenerator,
    message: {
        status: false,
        message: "طلبات كثيرة لرمز التحقق، حاول لاحقاً"
    }
});

exports.aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator,
    message: { status: false, message: "طلبات كثيرة جداً، حاول بعد دقيقة" }
});

exports.generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    keyGenerator,
    message: { status: false, message: "عدد طلبات كبير جداً، حاول لاحقاً" }
});