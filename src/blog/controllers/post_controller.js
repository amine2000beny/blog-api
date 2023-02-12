const Post = require("../models/post");
const Comment = require("../models/comment");

const Profile = require("../../profile/models/profile");
const RESPONSE_MESSAGES = require("../../../__constants__/response_messages");

const { getUrl } = require("../../../utils/getter");
const { removeFields } = require("../../../utils/remover");
const { _lengthValidator } = require("../validator");

const createPost = async (req, res) => {
    const { content, createdBy, title } = req.body;

    if (!_lengthValidator(content, 10, 200)) {
        return res.status(400).json({ msg: RESPONSE_MESSAGES.INVALID_POST_BODY_LENGTH(10, 200) });
    }

    const profile = await Profile.findOne({ id: req.body.createdBy }).exec();
    if (profile.owner !== req.account) {
        return res.status(401).json({ msg: "Unauthorized" });
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

    const post = await Post.findOne({ id: id }).exec();
    if (!post) {
        return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
    }

    try {
        await Promise.all([post.deleteOne(), Comment.deleteMany({ post: req.params.id })]);

        res.status(204).end();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getAll = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        let posts = await Post.find()
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .select("-_id -__v")
            .lean()
            .exec();

        const count = await Post.find().count();

        posts = await Promise.all(
            posts.map(async (post) => {
                const count = await Comment.find({ id_post: post.id }).count();

                return { ...post, commentsCount: count };
            }),
        );

        res.status(200).json({
            posts: posts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getById = async (req, res) => {
    const { id } = req.params;

    try {
        let post = await Post.findOne({ id: id }).exec();
        if (!post) {
            return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
        }

        const count = await Comment.find({ id_post: post.id }).count();

        post = {
            ...removeFields(post.toObject()),
            commentsCount: count,
        };

        res.status(200).json({ post: post });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const updatePost = async (req, res) => {
    const { id } = req.params;
    const { content, createdBy, title } = req.body;

    if (!_lengthValidator(content, 10, 200)) {
        return res.status(400).json({ msg: RESPONSE_MESSAGES.INVALID_POST_BODY_LENGTH(10, 200) });
    }

    const update = {
        content: content,
        createdBy: createdBy,
        title: title,
        updatedAt: Date.now(),
    };

    try {
        const post = await Post.findOneAndUpdate({ id }, update, {
            new: true,
            runValidators: true,
        })
            .select("-_id -__v")
            .lean()
            .exec();

        if (!post) {
            return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
        }

        res.header("Location", getUrl(req, id));
        res.status(200).json({ post: post });
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
