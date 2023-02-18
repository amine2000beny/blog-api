const Person = require("../models/person");
const Company = require("../models/company");
const Profile = require("../models/profile");
const Post = require("../../blog/models/post");
const Comment = require("../../blog/models/comment");

const { getUrl } = require("../../../utils/getter");
const { removeFields } = require("../../../utils/remover");

const createProfile = async (req, res) => {
    const { kind, ...body } = req.body;
    let profile;

    const profiles = await Profile.countDocuments({ owner: req.account }).exec();
    if (profiles > 4) return res.status(400).json({ msg: "erreur : un profil doit égal a 5" });

    const data = { ...body, owner: req.account };

    try {
        switch (kind) {
            case "person":
                profile = new Person(data);
                break;
            case "company":
                profile = new Company(data);
                break;
            default:
                return res.status(400).json({ msg: "Invalid kind" });
        }

        await profile.save();

        res.header("Location", getUrl(req, profile.id));
        res.status(201).json(removeFields(profile.toObject()));
    } catch (err) {
        res.status(500).json({ msg: err });
    }
};

const deleteProfile = async (req, res) => {
    const { id, owner } = req.profile;

    if(owner !== req.account)
        return res.status(400).json({ msg: "Erreur : il n'y a pas de droits" });

    try {
        await Promise.all([Profile.deleteOne({ id }), Post.deleteMany({ owner: id }), Comment.deleteMany({ owner: id })]);

        res.status(204).end();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getMyProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find({ owner: req.account }).lean().exec();

        res.status(200).json({
            profiles: removeFields(profiles),
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getById = async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await Profile.findOne({ id: id }).lean().exec();
        if (!profile) {
            return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
        }

        res.status(200).json(removeFields(profile));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getMyPosts = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { id } = req.params;

    try {
        const posts = await Post.find({ owner: id })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean()
            .exec();
        if (!posts) {
            return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
        }

        res.status(200).json({
            posts: removeFields(posts),
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getMyComments = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { id } = req.params;

    try {
        const comments = await Comment.find({ owner: id })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean()
            .exec();
        if (!comments) {
            return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
        }

        res.status(200).json({
            comments: removeFields(comments),
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createProfile,
    deleteProfile,
    getMyProfiles,
    getById,
    getMyPosts,
    getMyComments
};
