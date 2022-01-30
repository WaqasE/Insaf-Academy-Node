const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Topic Schema 
const TopicSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    order: {
        type: Number,
        default: 0
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

// Create Schema
const ChapterSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    subject: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Subject'
    },
    topics: {
        type: [TopicSchema],
    },
    description: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },

});

module.exports = Chapter = mongoose.model("chapter", ChapterSchema);