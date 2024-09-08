const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getCurrentUser, refreshAccessToken, logoutUser } = require("../controllers/usersController");
const validateToken = require("../middleware/validateTokenHandler");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/current", validateToken, getCurrentUser);

router.get("/refresh-token", refreshAccessToken);

module.exports = router;


