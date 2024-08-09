const asyncHandler = require("express-async-handler");
const Post = require("../models/post");

const addPost = asyncHandler(async (req, res) => {
  const { desc, photo } = req.body;
  const userId = req.user._id;

  if (!desc && !photo) {
    res.status(400);
    throw new Error("please fill in all fields");
  }

  const newPost = await Post.create({ desc, photo, user: userId });

  //   const user = await User.findById(userId);
  //   user.posts.push(newPost._id);
  //   await user.save();

  res.status(201).json(newPost);
});

const postController = { addPost };

module.exports = postController;
