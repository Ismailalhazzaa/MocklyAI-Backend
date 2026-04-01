const express = require('express');
const dashboardController = require("../controllers/dashboard.controller");
const verify_token = require('../middlewares/verifyToken');
const router = express.Router();

router.route("/user-dashboard").get(verify_token, dashboardController.getUserDashboardData);








module.exports = router;