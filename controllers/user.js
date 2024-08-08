const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !email || !username || !password) {
    res.status(400);
    throw new Error("please fill in all fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  const checkUsername = await User.find({ username });

  if (checkUsername) {
    res.status(400);
    throw new Error("username name has be taken");
  }

  const checkEmail = await User.find({ email });

  if (checkEmail) {
    res.status(400);
    throw new Error("email has alredy been used");
  }

  const user = await User.create({ name, username, email, password });

  if (user) {
    const token = generateToken(user._id);

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });

    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error("unable to register user");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  res.send("Login");
});

const uploadPhoto = asyncHandler(async (req, res) => {
  res.send("upload image");
});

const userControllers = { loginUser, registerUser, uploadPhoto };

module.exports = userControllers;
