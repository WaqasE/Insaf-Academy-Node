const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Topic Schema 
const QuestionBankSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    explaination: {
        type: String,
        required: true
    },
    options: {
        type: Array
    },
    answers: {
        type: Array
    },
    userID:{
        type:mongoose.Types.ObjectId
    },
    classID:{
        type:mongoose.Types.ObjectId
    },
    chapterID: {
        type: mongoose.Types.ObjectId,
    },
    topicID: {
        type: mongoose.Types.ObjectId,
    },
    subjectID: {
        type: mongoose.Types.ObjectId,
    },
    difficulty: {
        type: String,
        enum: ['EASY', 'MEDIUM', 'HARD'],
        default: 'EASY'
    },
    tags: {
        type: Array,
        default: []
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})



module.exports = QuestionBank = mongoose.model("questionBank", QuestionBankSchema);