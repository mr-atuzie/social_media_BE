const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Notification = require("../models/notification");

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
  const users = await User.find().populate("post");

  res.status(200).json({ result: users.length, users });
});

const currentUser = asyncHandler(async (req, res) => {
  const user = await User.find(req.user._id);

  res.status(200).json(user);
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

const followUser = asyncHandler(async (req, res) => {
  const follow = req.params.id;
  const userId = req.user._id;

  const user = await User.findById(userId);
  const otherUser = await User.findById(follow);

  if (user.following.includes(follow)) {
    //unfollow user logic

    //remove user id from current user
    user.following = user.following.filter(
      (item) => item.toString() !== follow.toString()
    );
    await user.save();

    otherUser.follower = otherUser.follower.filter(
      (item) => item.toString() !== userId.toString()
    );

    await otherUser.save();

    await Notification.create({
      type: "unfollow",
      msg: `${user.username} unfollowed you`,
      user: follow,
      from: userId,
    });

    const usersToFollow = await User.find(
      {
        _id: { $ne: userId }, // Exclude the current user
        follower: { $nin: [userId] }, // Exclude users that are followed by the current user
      },
      "username _id avatar name"
    );

    res
      .status(200)
      .json({ msg: "unfollow", isFollowing: false, usersToFollow });
  } else {
    //follow user
    user.following.push(follow);
    await user.save();

    //update other user
    otherUser.follower.push(userId);
    await otherUser.save();

    await Notification.create({
      type: "follow",
      msg: `${user.username} followed you`,
      user: follow,
      from: userId,
    });

    const usersToFollow = await User.find(
      {
        _id: { $ne: userId }, // Exclude the current user
        follower: { $nin: [userId] }, // Exclude users that are followed by the current user
      },
      "username _id avatar name"
    );

    res.status(200).json({ msg: "follow", isFollowing: true, usersToFollow });
  }
});

const isFollowing = asyncHandler(async (req, res) => {
  const follow = req.params.id;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (user.following.includes(follow)) {
    res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
});

const whoToFollow = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Get the current user
  const currentUser = await User.findById(userId);

  if (!currentUser) {
    res.status(400);
    throw new Error("User not found");
  }

  // Get users who are not followed by the current user
  const usersToFollow = await User.find(
    {
      _id: { $ne: userId }, // Exclude the current user
      follower: { $nin: [userId] }, // Exclude users that are followed by the current user
    },
    "username _id avatar name"
  );

  res.status(200).json(usersToFollow);
});

const userFollowers = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Find the user and populate the followers array
  const user = await User.findById(userId).populate(
    "follower",
    "username email name avatar coverPic _id"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Send back the list of followers
  res.status(200).json(user.follower);
});

const userFollowing = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Find the user and populate the followers array
  const user = await User.findById(userId).populate(
    "following",
    "username email name avatar coverPic _id"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Send back the list of followers
  res.status(200).json(user.following);
});

const getNotifcation = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const notifications = await Notification.find({ user: userId })
    .populate("from")
    .populate("post")
    .sort({ createdAt: -1 });

  res.status(200).json(notifications);
});

const searchUser = asyncHandler(async (req, res) => {
  const { username } = req.body;

  console.log(username);

  if (!username) {
    res.status(400);
    throw new Error("Username  parameter is required");
  }

  const users = await User.find(
    { username: { $regex: username, $options: "i" } },
    "username _id avatar name"
  ).limit(10);

  res.status(200).json(users);
});

const userControllers = {
  loginUser,
  registerUser,
  uploadPhoto,
  loginStatus,
  logout,
  getUsers,
  getUser,
  currentUser,
  getNotifcation,
  followUser,
  isFollowing,
  whoToFollow,
  userFollowers,
  userFollowing,
  searchUser,
};

module.exports = userControllers;
