const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema(
  {
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followers: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Follow = mongoose.model("Follow", followerSchema);
module.exports = Follow;
