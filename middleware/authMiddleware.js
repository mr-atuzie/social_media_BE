const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const protect = asyncHandler((req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(400);
    throw new Error("not authourized");
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      res.status(400);
      throw new Error("inavlid or expired token");
    } else {
      const user = await User.findById(data.id).select("-password");

      if (!user) {
        res.status(400);
        throw new Error("invalid user");
      }

      req.user = user;
      next();
    }
  });
});

module.exports = { protect };
