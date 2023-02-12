const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
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
    postId: {
        type: String,
        ref: "Post",
    },
});

module.exports = mongoose.model("Comment", commentSchema);
