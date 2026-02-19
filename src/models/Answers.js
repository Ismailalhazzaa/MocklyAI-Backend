const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true 
    },
    textAnswer: {
        type: String,
        required: true
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
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});


let Answer = mongoose.model('Answer',answerSchema,'answer'); 
module.exports = Answer ; 
