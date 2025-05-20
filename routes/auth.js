const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

// Registration
router.get("/register", (req, res) => {
  res.render("register", { message: '' });
});

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // console.log("Received:", { username, email, password });

  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/) || password.length < 8) {
    return res.render("message", {
      message: "Invalid email or password too short",
    });
  }

  // Check if user exists
  const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
  db.query(checkQuery, [email, username], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.render("message", {
        message: "Registration failed. Try again.",
      });
    }

    if (results.length > 0) {
      return res.render("message", {
        message: "Email or Username already exists",
      });
    }

    // Hash password and insert user
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Hashing error:", err);
        return res.render("message", {
          message: "Registration failed. Try again.",
        });
      }

      const insertQuery =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      db.query(insertQuery, [username, email, hashedPassword], (err) => {
        if (err) {
          console.error("Insert error:", err);
          return res.render("message", {
            message: "Registration failed. Try again.",
          });
        }

        res.render("message", {
          message: "Registration successful! Please login.",
        });
      });
    });
  });
});

// Login
router.get('/login', (req, res) => {
  res.render('login', { message: '' });  // pass an empty message string or a real message here
});


router.post("/login", (req, res) => {
  const { identifier, password, token } = req.body;

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;

  axios
    .post(verifyUrl)
    .then((response) => {
      if (!response.data.success) {
        return res.render("message", { message: "Invalid reCAPTCHA" });
      }

      // Fetch user from database
      const findUserQuery =
        "SELECT * FROM users WHERE email = ? OR username = ?";
      db.query(findUserQuery, [identifier, identifier], (err, results) => {
        if (err) {
          console.error("Login error:", err);
          return res.render("message", { message: "Login failed" });
        }

        if (results.length === 0) {
          return res.render("message", { message: "User not found" });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err || !isMatch) {
            return res.render("message", { message: "Incorrect password" });
          }

          const authToken = jwt.sign(
            {
              id: user.id,
              username: user.username,
              email: user.email,
            },
            JWT_SECRET,
            { expiresIn: "1h" }
          );

          res.cookie("token", authToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000, // 1 hour in ms
          });

          res.redirect("/profile");
        });
      });
    })
    .catch((err) => {
      console.error("reCAPTCHA error:", err);
      res.render("message", { message: "Login failed" });
    });
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
