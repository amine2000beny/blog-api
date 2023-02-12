const router = require("express").Router();
const Profile = require("./models/profile");
const Post = require("../blog/models/post");

const { createProfile } = require("./controllers/profile_controller");

// @route   GET /
router.get("/", async (req, res) => {
    const profiles = await Profile.find({ owner: req.account }).select("-_id -__v");

    res.json(profiles);
});

// @route   POST /
router.post("/", createProfile);

// @route   PATCH /
router.patch("/:id", (req, res) => {
    const { id } = req.params;

    if (id !== req.account) {
        return res.status(401).json({ msg: "Unauthorized" });
    }

    return res.status(200).json({ msg: "Update profile" });
});

// @route   DELETE /
// TODO: Delete authenticated account.profile
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await Profile.findOne({ id: id }).exec();
        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }
        console.log(profile.owner);
        console.log(req.account);

        if (profile.owner !== req.account) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        await profile.delete();

        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// @route   GET /:id
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await Profile.findOne({ id: id }).select("-_id -__v").lean().exec();

        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        res.status(200).json({ profile: profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /:id/posts
router.get("/:id/posts", async (req, res) => {
    const { id } = req.params;

    try {
        const posts = await Post.find({ createdBy: id }).select("-_id -__v").exec();

        res.status(200).json({ posts: posts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /:id/comments
router.get("/:id/comments", async (req, res) => {
    const { id } = req.params;

    try {
        const comments = await Comment.find({ owner: id }).select("-_id -__v").exec();

        res.status(200).json({ comments: comments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
