const Question = require("../models/Questions");
const Session = require("../models/Sessions.js");
const appError = require("../utils/handelError.js");
const FormData = require("form-data");
const Answer = require("../models/Answers.js");
const axios = require("axios");
const { generateAIResponse } = require("../utils/aiService.js");
const { buildQuestionPrompt, buildAnswerAnalysisPrompt } = require("../utils/aiPrompts.js");

const createQuestion = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const session = await Session.findById(sessionId);
        if (!session) {
            return next(
                appError.create("لا يمكن انشاء سؤال لجلسة غير موجودة", 400, false)
            );
        }
        if (session.numberOfQuestions <= session.currentQuestionNumber) {
            return next(
                appError.create("لقد بلغت الحد الأقصى لعدد أسئلة الجلسة", 400, false)
            );
        }
        const previousQuestions = await Question.find({ sessionId: sessionId }) || [];
        const prompt = buildQuestionPrompt(session.specialization, session.difficultyLevel, previousQuestions);
        const aiQuestion = await generateAIResponse(prompt);
        const question = await Question.create({ sessionId: sessionId, questionText: aiQuestion.questionText, canonicalText: aiQuestion.canonicalText, category: aiQuestion.category, specialization: session.specialization });
        session.currentQuestionNumber += 1;
        await session.save();
        res.status(201).json({ status: "SUCCESS", data: question});
    } catch (error) {
        return next(
            appError.create("حدث خطأ أثناء عملية إنشاء السؤال", 500, false)
        );
    }
};

const analysisAnswer = async (req, res, next) => {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId);
        if (!question) {
            return next(appError.create("لا يمكن إضافة جواب لسؤال غير موجود", 400, false));
        }
        const { answerType } = req.body;
        if (answerType === "voice") {
            const file = req.file;
            if (!file) {
                return next(appError.create("لم يتم تحميل الجواب الصوتي", 400, false));
            }
            const textAnswer = await speechToTextTranscribe(file);
            const prompt = buildAnswerAnalysisPrompt(question, textAnswer);
            const aiAnalysis = await generateAIResponse(prompt);
            const answer = await Answer.create({ questionId: questionId, textAnswer: textAnswer, score: aiAnalysis.score, aiEvaluation: aiAnalysis.aiEvaluation });
            return res.status(200).json({ status: "SUCCESS", data: aiAnalysis });
        }
        const { answertext } = req.body;
        const prompt = buildAnswerAnalysisPrompt(question, answertext);
        const aiAnalysis = await generateAIResponse(prompt);
        const answer = await Answer.create({ questionId: questionId, textAnswer: answertext, score: aiAnalysis.score, aiEvaluation: aiAnalysis.aiEvaluation });
        res.status(200).json({ status: "SUCCESS", data: aiAnalysis });
    } catch (error) {
        return next(appError.create("حدث خطأ أثناء عملية تحليل الجواب", 500, false));
    }
};
// method to connect with python service
const speechToTextTranscribe = async (file) => {
    try {
        const formData = new FormData();
        formData.append("audio", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });
        const response = await axios.post("http://localhost:5000/transcribe", formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        if (!response.data.status) {
            throw new Error(`فشل التحويل: ${response.data.message}`);
        }
        return response.data.text;
    } catch (error) {
        console.error("خطأ في speechToTextTranscribe:", error.message);
        throw error;
    }
};



module.exports = {
    createQuestion,
    analysisAnswer
};