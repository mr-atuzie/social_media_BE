const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const postController = require("../controllers/post");
const router = express.Router();

router.post("/", protect, postController.addPost);

module.exports = router;
