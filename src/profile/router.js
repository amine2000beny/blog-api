const router = require("express").Router();

const {
    createProfile,
    getProfileComments,
    getProfilePosts,
    getProfileById,
    deleteProfile,
    getProfiles,
} = require("./controllers/profile_controller");

// @route   GET /
router.get("/", getProfiles);

// @route   POST /
router.post("/", createProfile);

// @route   PATCH /
router.patch("/:id", (req, res) => {
    return res.status(200).json({ msg: "Update profile" });
});

// @route   DELETE /
router.delete("/:id", deleteProfile);

// @route   GET /:id
router.get("/:id", getProfileById);

// @route   GET /:id/posts
router.get("/:id/posts", getProfilePosts);

// @route   GET /:id/comments
router.get("/:id/comments", getProfileComments);

module.exports = router;
