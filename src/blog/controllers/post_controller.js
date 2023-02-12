const Post = require("../models/post");
const Comment = require("../models/comment");

const RESPONSE_MESSAGES = require("../../../__constants__/response_messages");

const { getUrl } = require("../../../utils/getter");
const { removeFields } = require("../../../utils/remover");
const { _lengthValidator } = require("../validator");

const createPost = async (req, res) => {
    const { content, createdBy, title } = req.body;

    if (!_lengthValidator(content, 10, 200)) {
        return res.status(400).json({ msg: RESPONSE_MESSAGES.INVALID_POST_BODY_LENGTH(10, 200) });
    }

    const post = new Post({
        content: content,
        createdBy: createdBy,
        title: title,
    });

    try {
        await post.save();

        res.header("Location", getUrl(req, post.id));
        res.status(201).json({ post: removeFields(post.toObject()) });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const deletePost = async (req, res) => {
    const { id } = req.params;

    const deletedPost = await Post.findOneAndDelete({ id: id });
    if (!deletedPost) {
        return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
    }

    try {
        await Comment.deleteMany({ postId: id });
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getAll = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const postCount = await Post.countDocuments();
        const posts = await Post.aggregate([
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: parseInt(limit),
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "id",
                    foreignField: "postId",
                    as: "comments",
                },
            },
            {
                $project: {
                    commentsCount: { $size: "$comments" },
                    createdAt: 1,
                    createdBy: 1,
                    content: 1,
                    id: 1,
                    title: 1,
                    updatedAt: 1,
                    _id: 0,
                },
            },
        ]).exec();

        res.status(200).json({
            posts,
            count: postCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(postCount / limit),
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findOne({ id: id }).select("-_id -__v").lean().exec();
        if (!post) {
            return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
        }

        post.commentsCount = await Comment.countDocuments({ postId: post.id });

        res.status(200).json({ post });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const updatePost = async (req, res) => {
    const { id } = req.params;
    const { content, title } = req.body;

    if (!_lengthValidator(content, 10, 200)) {
        return res.status(400).json({ msg: RESPONSE_MESSAGES.INVALID_POST_BODY_LENGTH(10, 200) });
    }

    const update = {
        content: content,
        title: title,
        updatedAt: Date.now(),
    };

    try {
        const post = await Post.findOneAndUpdate({ id }, update, {
            new: true,
            runValidators: true,
        }).select("-_id -__v").exec();

        if (!post) {
            return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
        }

        res.header("Location", getUrl(req, id));
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createPost,
    deletePost,
    getAll,
    getById,
    updatePost,
};
