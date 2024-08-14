const asyncHandler = require("express-async-handler");
const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment");

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

const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("user");

  res.status(200).json({ result: posts.length, posts });
});

const getPost = asyncHandler(async (req, res) => {
  const postId = req.params.id;

  const post = await Post.findById(postId);

  res.status(200).json(post);
});

const likePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    res.status(200);
    throw new Error("post does not exist");
  }

  if (post.likes.includes(userId)) {
    await Like.findOneAndDelete({ post: postId, user: userId });

    post.likes = post.likes.filter(
      (item) => item.toString() !== userId.toString()
    );
    await post.save();

    res.status(200).json({ post, msg: "dislike" });
  } else {
    const newLike = new Like({ user: userId, post: postId });
    await newLike.save();

    post.likes.push(userId);
    await post.save();

    res.status(200).json({ post, msg: "like" });
  }

  // const user = await User.findById(userId);
  // user.likes.push(newLike._id);
  // await user.save();
});

const addComment = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  const { comment } = req.body;

  const checkForPost = await Post.findById(postId);

  if (!checkForPost) {
    res.status(200);
    throw new Error("post does not exist");
  }

  if (!comment) {
    res.status(400);
    throw new Error("please fill in all fields");
  }

  const newComment = new Comment({ comment, post: postId, user: userId });
  await newComment.save();

  const post = await Post.findById(postId);
  post.comments.push(newComment._id);
  await post.save();

  res.status(201).json({ newComment, post });

  //   const user = await User.findById(userId);
  //   user.comments.push(newComment._id);
  //   await user.save();
});

// get all post comment
const getComments = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comment.find({ post: postId }).populate("user");

  res.status(200).json({ result: comments.length, comments });
});

const check = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    res.status(200);
    throw new Error("post does not incident");
  }
  const like = await Like.findOne({ post: postId, user: userId });

  res.send(like);
  // const user = await User.findById(userId);
  // user.likes.push(newLike._id);
  // await user.save();
});

const postController = {
  addPost,
  getPosts,
  getPost,
  likePost,
  check,
  addComment,
  getComments,
};

module.exports = postController;
