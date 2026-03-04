const Question = require("../models/Questions");
const Session = require("../models/Sessions.js");
const appError = require("../utils/handelError.js");
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








module.exports = {
    createQuestion
};