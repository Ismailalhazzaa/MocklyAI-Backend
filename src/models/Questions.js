const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const questionSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true 
    },
    questionText: {
        type: String,
        required: true
    },
    canonicalText: { // لتحويل السؤال الى صيغة قياسية من أجل معرفة عدد مرات تكرار السؤال 
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: ["general", "behavioral", "technical"],
        required: true
    },
    specialization: {
        type: String,
        index: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});


let Question = mongoose.model('Question',questionSchema,'question'); 
module.exports = Question ; 
