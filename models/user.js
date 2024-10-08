const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a name."] },
    username: {
      type: String,
      required: [true, "Please add a username."],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please add a email."],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid emaial",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must be up to 6 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    coverPic: {
      type: String,
      default:
        "https://garden.spoonflower.com/c/12359263/p/f/l/bTUNumvFmPzvHski3IXgNWlkrWaTMC0CWTvgFGjzJapZfTNOtUBjMR8/Solid%20light%20grey.jpg",
    },
    phone: {
      type: String,
    },
    description: {
      type: String,
    },
    city: {
      type: String,
    },
    school: {
      type: String,
    },
    work: {
      type: String,
    },
    avatar: {
      type: String,
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [], // Default value is an empty array
      },
    ],
    follower: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [], // Default value is an empty array
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
