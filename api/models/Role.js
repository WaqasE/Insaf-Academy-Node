const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const RoleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    permissions: {
        type: Object,
        required: true
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

module.exports = Role =  mongoose.model("role", RoleSchema);