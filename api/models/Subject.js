const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const SubjectSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    class: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref:'Class'
    },
    assignedTo: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref:'User'
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        default: '',
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

module.exports = Subject = mongoose.model("subject", SubjectSchema);