const express = require('express');
const router = express.Router();
const verify_token = require('../middlewares/verifyToken');
const questionController = require("../controllers/question.controller");


router.route("/create-question/:sessionId").get(verify_token, questionController.createQuestion);















module.exports = router