const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    feedbacktext: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});


let Feedback = mongoose.model('Feedback',feedbackSchema,'feedback'); 
module.exports = Feedback; 
