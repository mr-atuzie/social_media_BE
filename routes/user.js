const express = require("express");
const userControllers = require("../controllers/user");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", userControllers.registerUser);

router.post("/login", userControllers.loginUser);

router.get("/loginStatus", userControllers.loginStatus);

router.get("/logout", userControllers.logout);

router.get("/", userControllers.getUsers);

router.get("/currentUser", protect, userControllers.currentUser);

router.get("/:id", userControllers.getUser);

router.patch("/uploadPhoto", protect, userControllers.uploadPhoto);

module.exports = router;
