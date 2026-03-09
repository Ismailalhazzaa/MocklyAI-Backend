const appError = require('../utils/handelError');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const verifyToken = async (req, res, next) => { 
    const authHeader = req.headers['Authorization'] || req.headers['authorization'];
    if (!authHeader) {
        return next(appError.create('token is required', 401, "ERROR"));
    }
    const token = authHeader.split(' ')[1];
    try {
        const currentUser = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(currentUser.id);
        if (!user) {
            return next(appError.create('المستخدم غير موجود', 401, "ERROR"));
        }
        if (!user.token) {
            return next(appError.create('يرجى تسجيل الدخول مجدداً', 401, "ERROR"));
        }
        if (user.token !== token) {
            return next(appError.create('يرجى تسجيل الدخول مجدداً', 401, "ERROR"));
        }
        req.currentUser = currentUser;
        next();
    } catch (err) {
        return next(appError.create('invalid token', 401, "ERROR"));
    }
};

module.exports = verifyToken;