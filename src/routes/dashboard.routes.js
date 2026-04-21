const express = require('express');
const dashboardController = require("../controllers/dashboard.controller");
const verify_token = require('../middlewares/verifyToken');
const { generalLimiter } = require("../middlewares/rateLimiter");
const router = express.Router();

router.route("/user-dashboard").get(verify_token, generalLimiter, dashboardController.getUserDashboardData);








module.exports = router;