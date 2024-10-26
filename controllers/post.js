const asyncHandler = require("express-async-handler");
const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment");
const Notification = require("../models/notification");
const User = require("../models/user");

const addPost = asyncHandler(async (req, res) => {
  const { desc, photo } = req.body;
  const userId = req.user._id;

  if (!desc && !photo) {
    res.status(400);
    throw new Error("please fill in all fields");
  }

  const newPost = await Post.create({ desc, photo, user: userId });

  const user = await User.findById(userId);
  user.posts.push(newPost._id);
  await user.save();

  res.status(201).json(newPost);
});

const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("user").sort({ createdAt: -1 });

  res.status(200).json({ result: posts.length, posts });
});

const getPost = asyncHandler(async (req, res) => {
  const postId = req.params.id;

  const post = await Post.findById(postId).populate("user");

  res.status(200).json(post);
});

const getUserPosts = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const posts = await Post.find({ user: userId })
    .populate("user")
    .sort({ createdAt: -1 });

  res.status(200).json({ result: posts.length, posts });
});

const likePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const post = await Post.findById(postId).populate("user");
  const likedBy = await User.findById(userId);

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

    const notification = await Notification.create({
      type: "like",
      msg: `${likedBy.username} liked your post`,
      user: post.user,
      post: postId,
      from: userId,
    });

    res.status(200).json({ post, msg: "like", notification });
  }

  // const user = await User.findById(userId);
  // user.likes.push(newLike._id);
  // await user.save();
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const post = await Post.findById(postId).populate("user");

  if (!post) {
    res.status(200);
    throw new Error("post does not exist");
  }

  if (!post.user._id.equals(userId)) {
    console.log({ 1: post.user._id, 2: userId });

    res.status(200);
    throw new Error("Not authorized ....");
  }

  // const updatedPost = await Post.findByIdAndUpdate(
  //   postId,
  //   { deleted: true },
  //   { new: true }
  // );

  await Post.findByIdAndDelete(postId);

  // const posts = await Post.findByIdAndUpdate(postId, { deleted: false });
  // const posts = await Post.findById(postId).populate("user");

  const posts = await Post.find().populate("user").sort({ createdAt: -1 });

  res.status(200).json(posts);
});

const addComment = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  const { comment } = req.body;

  const checkForPost = await Post.findById(postId);
  const commentedBy = await User.findById(userId);

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

  await Notification.create({
    type: "comment",
    msg: `${commentedBy.username} commented on your post`,
    user: post.user,
    post: postId,
    from: commentedBy._id,
  });

  const comments = await Comment.find({ post: postId })
    .populate("user")
    .sort({ createdAt: -1 });

  res.status(201).json({ newComment, post, comments });

  //   const user = await User.findById(userId);
  //   user.comments.push(newComment._id);
  //   await user.save();
});

// get all post comment
const getComments = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comment.find({ post: postId })
    .populate("user")
    .sort({ createdAt: -1 });

  res.status(200).json({ result: comments.length, comments });
});

const postController = {
  addPost,
  getPosts,
  getPost,
  likePost,
  addComment,
  getComments,
  getUserPosts,
  deletePost,
};

module.exports = postController;
