const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique:true,
        required: true,
    },
    password:{
        type: String,
        required: true
    },
    token:{
        type:String
    },
    otp: {
        code: String,
        expiresAt: Date,
        attempts: {
            type: Number,
            default: 0
        },
        lastSentAt: Date
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    },
    totalTrainingMinutes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

let User = mongoose.model('User',userSchema,'user'); 
module.exports = User;