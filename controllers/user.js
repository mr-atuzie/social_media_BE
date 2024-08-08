const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
  res.send("REGISTER USER");
});

const loginUser = asyncHandler(async (req, res) => {
  res.send("Login");
});

const uploadPhoto = asyncHandler(async (req, res) => {
  res.send("upload image");
});

const userControllers = { loginUser, registerUser, uploadPhoto };

module.exports = userControllers;
