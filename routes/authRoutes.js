const express = require("express");
const router = express.Router();
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
} = require("../controllers/authcontroller");

// Register
router.get("/register", getRegister);
router.post("/register", postRegister);

// Login
router.get("/login", getLogin);
router.post("/login", postLogin);

// Logout
router.get("/logout", logout);

module.exports = router;
