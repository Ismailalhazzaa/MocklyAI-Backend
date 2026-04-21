const express = require('express');
const router = express.Router();
const verify_token = require('../middlewares/verifyToken');
const leaderBoardController = require("../controllers/leaderboard.controller");
const { generalLimiter } = require("../middlewares/rateLimiter");

router.route("/leaderboard-users").get(verify_token, generalLimiter, leaderBoardController.leaderBoardInformation);

module.exports = router;