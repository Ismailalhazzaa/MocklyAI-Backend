const { body } = require("express-validator");

exports.signupValidation = [
    body("fullname")
        .notEmpty()
        .withMessage("الاسم الكامل مطلوب"),

    body("email")
        .isEmail()
        .withMessage("بريد الكتروني غير صحيح"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("كلمة السر يجب ان تكون على الاقل مكونة من 6 خانات")
];

exports.loginValidation = [
    body("email")
        .notEmpty()
        .withMessage("البريد الإلكتروني مطلوب")
        .isEmail()
        .withMessage("بريد إلكتروني غير صالح"),

    body("password")
        .notEmpty()
        .withMessage("كلمة المرور مطلوبة")
];
