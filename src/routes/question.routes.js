const express = require('express');
const router = express.Router();
const verify_token = require('../middlewares/verifyToken');
const questionController = require("../controllers/question.controller");
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        'audio/mpeg',
        'audio/mp4',
        'audio/x-m4a',
        'audio/wav',
        'audio/ogg',
        'audio/flac',
        'audio/aac',
        'audio/x-ms-wma',
        'audio/x-matroska',
        'audio/webm'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("نوع الملف غير مدعوم"), false);
    }
};

const uploadVoice = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
});

router.route("/create-question/:sessionId").get(verify_token, questionController.createQuestion);
router.route("/analysis-answer/:questionId").post(verify_token, uploadVoice.single("audio"), questionController.analysisAnswer);














module.exports = router