const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

  const checkUsername = await User.findOne({ username });

  if (checkUsername) {
    res.status(400);

    throw new Error("username name has be taken");
  }

  const checkEmail = await User.findOne({ email });

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
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error("please fill in all fields");
  }

  const user = await User.findOne({ username });

  if (!user) {
    res.status(400);
    throw new Error("username does not exist");
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    res.status(400);
    throw new Error("invalid login credentials,check email or password");
  }

  const token = await generateToken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  res.status(200).json(user);
});

const uploadPhoto = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { photo } = req.body;

  if (!photo) {
    res.status(400);
    throw new Error("please add photo");
  }

  const userDoc = await User.findByIdAndUpdate(
    userId,
    { avatar: photo },
    { new: true }
  );

  res.status(200).json(userDoc);
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({ result: users.length, users });
});

const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  res.status(200).json(user);
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json(false);
  }

  //Verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if (err) {
      res.json(false);
    } else {
      res.json(true);
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });

  res.status(200).json("Successfully Logged Out");
});

const userControllers = {
  loginUser,
  registerUser,
  uploadPhoto,
  loginStatus,
  logout,
  getUsers,
  getUser,
};

module.exports = userControllers;
