const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ClassSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
});

module.exports = Class = mongoose.model("Class", ClassSchema);