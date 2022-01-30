const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const QuizSchema = new Schema({
    questions: {
        type: [mongoose.Types.ObjectId],
    },
    duration: {
        type: String,
    },
    passingGrade: {
        type: String,
    },
    random: {
        type: Boolean,
    },
    difficulty: {
        type: Object,
    },
})

module.exports = Quiz = mongoose.model("quiz", QuizSchema);