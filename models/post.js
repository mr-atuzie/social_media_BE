const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    desc: {
      type: String,
    },
    photo: [String],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    deleted: {
      type: Boolean,
      default: false, // Default to false (not deleted)
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
