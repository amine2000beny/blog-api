const express = require("express");
const router = express.Router();

const { createPost, deletePost, getAll, getById, updatePost } = require("./controllers/post_controller");
const { createComment, deleteComment, getAllComments } = require("./controllers/comment_controller");
const { isOwner } = require("./middlewares");

// @route   GET /blog/posts
router.get("/posts", getAll);

// @route   GET /blog/posts/:id
router.get("/posts/:id", getById);

// @route   POST /blog/posts
router.post("/posts", isOwner, createPost);

// @route   PUT /blog/posts/:id
router.patch("/posts/:id", isOwner, updatePost);

// @route   DELETE api/blog/posts/:id
router.delete("/posts/:id", isOwner, deletePost);

// @route   GET /blog/posts/:id/comments
router.get("/posts/:id/comments", getAllComments);

// @route   POST /blog/posts/:id/comments
router.post("/posts/:id/comments", isOwner, createComment);

// @route   DELETE /blog/comments/:commentId
router.delete("/comments/:id", isOwner, deleteComment);

module.exports = router;
