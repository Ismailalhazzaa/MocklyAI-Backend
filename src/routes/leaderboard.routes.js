const express = require('express');
const router = express.Router();
const verify_token = require('../middlewares/verifyToken');
const leaderBoardController = require("../controllers/leaderboard.controller");

router.route("/leaderboard-users").get(verify_token, leaderBoardController.leaderBoardInformation);

module.exports = router;