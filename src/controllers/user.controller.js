const User = require("../models/Users");
const bcryptjs = require('bcryptjs');
const { generateOTP } = require("../utils/generateOTP");
const { sendMail } = require("../utils/sendMail");
const generateJwt = require('../utils/genrateJWT');
const appError = require("../utils/handelError.js");
const { validationResult } = require("express-validator");

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(appError.create("بيانات غير صالحة", 400, false));
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return next(appError.create("المستخدم غير موجود", 422, false));
        }
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return next(appError.create("الحساب محظور مؤقتاً", 423, false));
        }
        if (!user.isEmailVerified) {
            return next(appError.create("هذا الحساب غير مؤكد", 401, false));
        }
        const matchedPasswords = await bcryptjs.compare(password, user.password);
        if (!matchedPasswords) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 10 * 60 * 1000; // 10 دقائق
            }
            await user.save();
            return next(appError.create("كلمة المرور غير صحيحة", 401, false));
        }
        // نجاح login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        const token = await generateJwt({email:user.email, id:user._id, username:user.username});
        user.token = token;
        await user.save();
        return res.status(200).json({
            status: true,
            message: "SUCCESS",
            data: { user }
        });
    } catch (err) {
        return next(appError.create("حدث خطأ, يرجى إعادة المحاولة", 500, false));
    }
};

const signup = async (req, res, next) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            appError.create("حدث حطأ , يرجى التحقق من المعلومات التي تم إدخالها", 400, false)
    );
    }
    const { fullname, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(
        appError.create("هذا البريد مستخدم مسبقاً", 400, false)
        );
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const otpCode = generateOTP();
    const newUser = await User.create({
        fullname,
        email,
        password: hashedPassword,
        isEmailVerified: false,
        otp: {
        code: otpCode,
        expiresAt: Date.now() + 1000 * 60 * 5 // 5 دقائق
        }
    });
    await sendMail({ to: email, OTP: otpCode });
    res.status(201).json({
        status: true,
        message: "تم إنشاء الحساب. يرجى تأكيد البريد الإلكتروني"
    });
    } catch (err) {
        const error = appError.create(
        "حدث خطأ, يرجى إعادة المحاولة",
        500,
        false
        );
        return next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.currentUser.id);
        if(!user){
            const error = appError.create("المستخدم غير موجود", 302, false);
            return next(error)
        }
        user.token = null ; 
        user.save();
        res.status(200).send({ status: true, message: "SUCCSESS", data: null });
    } catch (error) {
        const er = appError.create("حدث حطأ, يرجى إعادة المحاولة", 302, false);
        return next(er);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(
                appError.create("البريد الإلكتروني مطلوب", 400, false)
            );
        }
        const user = await User.findOne({ email });
        if (!user) {
            return next(
                appError.create("المستخدم غير موجود", 404, false)
            );
        }
        const otpCode = generateOTP();
        user.otp = {
            code: otpCode,
            expiresAt: Date.now() + 1000 * 60 * 5 // 5 دقائق
        };
        await user.save();
        await sendMail({ to: email, OTP: otpCode });
        res.status(200).json({
            status: true,
            message: "تم إرسال رمز إعادة تعيين كلمة السر"
        });
    } catch (err) {
        return next(
            appError.create("حدث خطأ أثناء طلب إعادة تعيين كلمة السر", 500, false)
        );
    }
};

const updateUser = async (req, res, next) => {
    const {fullname} = req.body;
    try {
        if (!fullname) {
            return next(
                appError.create("الأسم الكامل مطلوب", 400, false)
            );
        }
        const updatedUser = await User.findByIdAndUpdate(req.currentUser.id, { fullname }, { new: true });
        if (!updatedUser) {
            return next(
                appError.create("فشلت عملية تحديث المعلومات", 400, false)
            );
        }
        res.status(201).json({ status: "SUCCESS", data: "تم تحديث معلومات المستخدم بنجاح" });
    } catch (error) {
        return next(
            appError.create("حدث خطأ أثناء عملية تحديث المعلومات", 500, false)
        );
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.currentUser.id);
        if (!user) {
            return next(appError.create("المستخدم غير موجود", 422, false));
        }
        res.status(200).json({ status: "SUCCESS", data: "تم حذف المستخدم بنجاح" });
    } catch (error) {
        return next(appError.create("حدث خطأ أثناء عملية حذف المستخدم, يرجى إعادة المحاولة", 500, false));
    }
};

const sendOTP = async (req, res, next) => {
    try {
    const { email } = req.body;
    if (!email) {
        return next(appError.create("البريد الالكتروني مطلوب", 400, false));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(appError.create("المستخدم غير موجود", 404, false));
    }
    const otpCode = generateOTP();
    user.otp = {
        code: otpCode,
        expiresAt: Date.now() + 1000 * 60 * 5 // 5 دقائق
    };
    await user.save();
    await sendMail({ to: email, OTP: otpCode });
    res.status(200).json({ status: "SUCCESS", message: "تم ارسال رمز التحقق" });
    } catch (err) {
        appError.create("حدث خطأ أثناء إرسال رمز التحقق", 500, false)
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.otp || !user.otp.code) {
            return next(appError.create("رمز التحقق غير صحيح", 400, false));
        }
        // إذا الحساب محظور
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return next(appError.create("الحساب محظور مؤقتاً", 423, false));
        }
        if (user.otp.expiresAt < Date.now()) {
            return next(appError.create("انتهت صلاحية رمز التحقق", 400, false));
        }
        if (user.otp.code !== code) {
            user.otp.attempts += 1;
            if (user.otp.attempts >= 5) {
                user.lockUntil = Date.now() + 5 * 60 * 1000; // 5 دقائق
                await user.save();
                return next(appError.create("تم حظر المحاولات مؤقتاً", 429, false));
            }
            await user.save();
            return next(appError.create("رمز التحقق خاطئ", 400, false));
        }
        // نجاح
        user.isEmailVerified = true;
        user.otp = undefined;
        user.lockUntil = undefined;
        await user.save();
        res.status(200).json({ status: "SUCCESS", message: "تم تأكيد البريد الالكتروني" });
    } catch (err) {
            appError.create("حدث خطأ أثناء تأكيد البريد الإلكتروني", 500, false)
    }
};

const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(appError.create("البريد الإلكتروني مطلوب", 400, false));
        }
        const user = await User.findOne({ email });
        if (!user) {
            return next(appError.create("المستخدم غير موجود", 404, false));
        }
        const COOLDOWN = 60 * 1000; // دقيقة
        if (user.otp?.lastSentAt && Date.now() - user.otp.lastSentAt < COOLDOWN) {
            return next(appError.create("انتظر قبل طلب رمز جديد", 400, false));
        }
        const otpCode = generateOTP();
        user.otp = {
            code: otpCode,
            expiresAt: Date.now() + 1000 * 60 * 5,
            attempts: 0,
            lastSentAt: Date.now()
        };
        await user.save();
        await sendMail({ to: email, OTP: otpCode });
        res.status(200).json({
            status: "SUCCESS",
            message: "تم إعادة إرسال رمز التحقق"
        });
    } catch (err) {
        return next(appError.create("حدث خطأ أثناء إعادة إرسال رمز التحقق", 500, false));
    }
}; 

const resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return next(
                appError.create(
                    "جميع الحقول مطلوبة",
                    400,
                    false
                )
            );
        }
        const user = await User.findOne({ email });
        if (!user || !user.otp || !user.otp.code) {
            return next(
                appError.create(
                    "رمز التحقق غير صالح",
                    400,
                    false
                )
            );
        }
        if (user.otp.expiresAt < Date.now()) {
            return next(
                appError.create(
                    "انتهت صلاحية رمز التحقق",
                    400,
                    false
                )
            );
        }
        if (user.otp.code !== code) {
            return next(
                appError.create(
                    "رمز التحقق خاطئ",
                    400,
                    false
                )
            );
        }
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined; // حذف الكود بعد الاستخدام
        await user.save();
        res.status(200).json({
            status: "SUCCESS",
            message: "تم إعادة تعيين كلمة السر بنجاح"
        });
    } catch (err) {
        return next(
            appError.create(
                "حدث خطأ أثناء إعادة تعيين كلمة السر",
                500,
                false
            )
        );
    }
};

module.exports = {
    login,
    sendOTP,
    signup,
    forgotPassword,
    deleteUser,
    verifyOTP,
    updateUser,
    logout,
    resendOTP,
    resetPassword
};