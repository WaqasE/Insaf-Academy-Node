const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ParentsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    cnic: {
        type: String,
        required: true,
    }

});

module.exports = Parents = mongoose.model("parents", ParentsSchema);

