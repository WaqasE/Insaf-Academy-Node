const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ContentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    topic: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    description: {
        type: String,
    },
    content: {
        type: mongoose.Schema.Types.Mixed, //We'll store link if file, id if video, string if text and id if quiz, now we'll have to figure out nature on the go,
        required: true,
        ref:'Quiz'
    },
    contentType: {
        type: String,
        enum: ['VIDEO', 'FILE', 'QUIZ', 'TEXT'],
        required: true
    }
})

module.exports = Content = mongoose.model("content", ContentSchema);