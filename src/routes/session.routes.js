const express = require('express');
const router = express.Router();
const verify_token = require('../middlewares/verifyToken');
const sessionController = require("../controllers/session.controller");


router.route("/create-session").post(verify_token ,sessionController.createSession);
router.route("/get-user-sessions").get(verify_token ,sessionController.getUserSessions);
router.route("/end-session/:sessionId").get(verify_token ,sessionController.endSession);
router.route("/export-user-statistics/:userId").get(verify_token ,sessionController.exportUserStatistic);
router.route("/session-details/:sessionId").get(verify_token, sessionController.getSessionDetails);






module.exports = router;