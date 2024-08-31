const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const postController = require("../controllers/post");
const router = express.Router();

router.post("/", protect, postController.addPost);

router.get("/", postController.getPosts);

router.get("/user/:id", postController.getUserPosts);

router.get("/:id", postController.getPost);

router.patch("/like/:postId", protect, postController.likePost);

router.post("/comment/:postId", protect, postController.addComment);

router.get("/comment/:postId", postController.getComments);

// test
router.get("/like/:postId", protect, postController.check);

module.exports = router;
