const Person = require("../models/person");
const Company = require("../models/company");

const { getUrl } = require("../../../utils/getter");
const { removeFields } = require("../../../utils/remover");
const { getComments, getPosts } = require("../../helpers");
const Profile = require("../models/profile");

const createProfile = async (req, res) => {
    const { kind, ...body } = req.body;

    try {
        const profileExists = await Person.find({ owner: req.account }).exec();
        if (profileExists.length >= 5) {
            return res.status(400).json({ msg: "You already have 5 profiles" });
        }

        let profile;

        switch (kind) {
            case "person":
                profile = new Person({ ...body, owner: req.account });
                break;
            case "company":
                profile = new Company({ ...body, owner: req.account });
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
    const { id } = req.params;

    try {
        const profile = await Profile.findOne({ id: id }).exec();
        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        await profile.delete();

        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

const getProfileById = async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await Profile.findOne({ id: id }).select("-_id -__v").lean().exec();

        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        res.status(200).json({ profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProfileComments = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const comments = await getComments({ createdBy: id }, page, limit);

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProfilePosts = async (req, res) => {
    const { id } = req.params;

    try {
        const posts = await getPosts({ createdBy: id });

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProfiles = async (req, res) => {
    const profiles = await Profile.find({ owner: req.account }).select("-_id -__v");

    res.json(profiles);
};

module.exports = {
    createProfile,
    deleteProfile,
    getProfileById,
    getProfileComments,
    getProfilePosts,
    getProfiles,
};
