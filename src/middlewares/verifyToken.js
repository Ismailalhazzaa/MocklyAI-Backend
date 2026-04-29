const AppError = require('../utils/handelError');
const jwt = require('jsonwebtoken');
const User = require('../models/Users'); 

const verifyToken = async (req, res, next) => { 
    const authHeader = req.headers['Authorization'] || req.headers['authorization'];
    if (!authHeader) {
        return next(AppError.create('token is required', 401, "ERROR"));
    }
    const token = authHeader.split(' ')[1];
    try {
        const currentUser = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(currentUser.id);
        if (!user) {
            return next(AppError.create('المستخدم غير موجود', 401, "ERROR"));
        }
        if (!user.token) {
            return next(AppError.create('يرجى تسجيل الدخول مجدداً', 401, "ERROR"));
        }
        if (user.token !== token) {
            return next(AppError.create('يرجى تسجيل الدخول مجدداً', 401, "ERROR"));
        }
        req.currentUser = currentUser;
        next();
    } catch (err) {
        return next(AppError.create('invalid token', 401, "ERROR"));
    }
};

module.exports = verifyToken;