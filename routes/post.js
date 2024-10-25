const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const postController = require("../controllers/post");
const router = express.Router();

router.post("/", protect, postController.addPost);

router.get("/", postController.getPosts);

router.get("/user/:id", postController.getUserPosts);

router.get("/:id", postController.getPost);

router.patch("/like/:postId", protect, postController.likePost);

router.patch("/delete/:postId", protect, postController.deletePost);

router.post("/comment/:postId", protect, postController.addComment);

router.get("/comments/:postId", postController.getComments);

module.exports = router;
