const express = require('express');
const router = express.Router();
const verify_token = require('../middlewares/verifyToken');
const userController = require("../controllers/user.controller");
const authValidator = require("../middlewares/authValidator");
const { authLimiter, otpLimiter } = require("../middlewares/rateLimiter");


router.route("/login").post(authLimiter, authValidator.loginValidation, userController.login);
router.route("/logout").get(verify_token, userController.logout);
router.route("/signup").post(authLimiter, authValidator.signupValidation, userController.signup);
router.route("/send-otp").post(userController.sendOTP);
router.route("/verify-otp").post(otpLimiter, userController.verifyOTP);
router.route("/forgot-password").post(otpLimiter, userController.forgotPassword);
router.route("/resend-otp").post(otpLimiter, userController.resendOTP);
router.route("/reset-password").post(otpLimiter, userController.resetPassword);
router.route("/delete-user").delete(verify_token, userController.deleteUser);
router.route("/update-user").put(verify_token, userController.updateUser);












module.exports = router