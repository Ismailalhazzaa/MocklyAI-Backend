const express = require('express');
const router = express.Router();
const verify_token = require('../middlewares/verifyToken');
const sessionController = require("../controllers/session.controller");
const { aiLimiter, generalLimiter } = require("../middlewares/rateLimiter");


router.route("/create-session").post(verify_token,aiLimiter, sessionController.createSession);
router.route("/get-user-sessions").get(verify_token, generalLimiter, sessionController.getUserSessions);
router.route("/end-session/:sessionId").get(verify_token, aiLimiter, sessionController.endSession);
router.route("/export-user-statistics/:userId").get(verify_token, generalLimiter, sessionController.exportUserStatistic);
router.route("/session-details/:sessionId").get(verify_token, generalLimiter, sessionController.getSessionDetails);






module.exports = router;