const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    specialization:{
        type: String,
        required: true
    },
    numberOfQuestions:{
        type: Number,
        required: true,
        default: 5
    },
    questionTypes: {
        type: [String],
        enum: ["text", "voice"],
        default: ["text"]
    },
    difficultyLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Intermediate"
    },
    currentQuestionNumber: {
        type: Number,
        default: 1
    },
    endedAt: {
        type: Date
    },
    durationMinutes: {
        type: Number
    },
    endedForced: {
        type: Boolean,
        default: false
    },
    softSkillsRecommendations: {
        type: [String],
        default: []
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});


let Session = mongoose.model('Session',sessionSchema,'session'); 
module.exports = Session ; 
