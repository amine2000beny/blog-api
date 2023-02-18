const router = require("express").Router();

const { createProfile, deleteProfile, getMyProfiles, getById, getMyPosts, getMyComments } = require("./controllers/profile_controller");
const { profileExistsMiddleware } = require("./middlewares");

// @route   GET /
// TODO:  Get authenticated account.profile
router.get("/", getMyProfiles);

// @route   POST /
router.post("/", createProfile);

// @route   PATCH /
// TODO:  Update authenticated account.profile
router.patch("/", (req, res) => {});

// @route   DELETE /
// TODO: Delete authenticated account.profile
router.delete('/:id', profileExistsMiddleware, deleteProfile);

// @route   GET /:id
// TODO: Get a profile by id
router.get("/:id", getById);

// @route   GET /:id/posts
// TODO: Get all posts from a profile
router.get("/:id/posts", getMyPosts);

// @route   GET /:id/comments
// TODO: Get all comments from a profile
router.get("/:id/comments", getMyComments);

module.exports = router;
