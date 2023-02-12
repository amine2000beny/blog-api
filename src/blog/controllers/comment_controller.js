const Comment = require("../models/comment");
const Post = require("../models/post");

const { getUrl } = require("../../../utils/getter");
const { removeFields } = require("../../../utils/remover");

const RESPONSE_MESSAGES = require("../../../__constants__/response_messages");
const { getComments } = require("../../helpers");

const createComment = async (req, res) => {
    const { id } = req.params;
    const { content, createdBy } = req.body;

    const post = await Post.findOne({ id: id }).exec();
    if (!post) {
        return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
    }

    const comment = new Comment({
        content: content,
        createdBy: createdBy,
        postId: post.id,
    });

    try {
        await comment.save();

        res.header("Location", getUrl(req, comment.id));
        res.status(201).json({ comment: removeFields(comment.toObject()) });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({
            id: req.params.id,
        });

        if (!comment) {
            return res.status(404).json({ msg: "Comment not found" });
        }

        res.status(204).end();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getAllComments = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const post = await Post.findOne({ id }).exec();
        if (!post) {
            return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
        }

        const comments = await getComments({ postId: id }, page, limit);

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createComment,
    deleteComment,
    getAllComments,
};
