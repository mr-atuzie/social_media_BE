const express = require("express");
const userControllers = require("../controllers/user");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", userControllers.registerUser);

router.post("/login", userControllers.loginUser);

router.get("/loginStatus", userControllers.loginStatus);

router.get("/notifications/:id", userControllers.getNotifcation);

router.get("/logout", userControllers.logout);

router.get("/", userControllers.getUsers);

router.get("/currentUser", protect, userControllers.currentUser);

router.get("/:id", userControllers.getUser);

router.get("/whoToFollow/:id", userControllers.whoToFollow);

router.get("/followers/:id", userControllers.userFollowers);

router.get("/following/:id", userControllers.userFollowing);

router.patch("/uploadPhoto", protect, userControllers.uploadPhoto);

router.patch("/follow/:id", protect, userControllers.followUser);

router.get("/isfollowing/:id", protect, userControllers.isFollowing);

module.exports = router;
