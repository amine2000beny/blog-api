const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const postSchema = new mongoose.Schema({
    content: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: String,
        ref: "Profile",
    },
    id: {
        type: String,
        default: uuidv4,
    },
    title: {
        type: String,
    },
    updatedAt: {
        type: Date,
    },
});

module.exports = mongoose.model("Post", postSchema);
