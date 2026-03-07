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
        enum: [3, 5, 10, 15],
        default: 5
    },
    questionTypes: {
        type: [String],
        enum: ["text", "voice"],
        default: ["text"],
        required: true
    },
    difficultyLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Intermediate",
        required: true
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
    ended: {
        type: Boolean,
        default: false
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    aiEvaluation: {
        clarity: {
            type: Number,
            min: 0,
            max: 100
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100
        },
        relevance: {
            type: Number,
            min: 0,
            max: 100
        },
        organization: {
            type: Number,
            min: 0,
            max: 100
        },
        engagement: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    strengths: {
        type: [String]
    },
    improvements: {
        type: [String]
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
