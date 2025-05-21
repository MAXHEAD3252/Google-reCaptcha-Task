const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const userModel = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Show Register Page
exports.getRegister = (req, res) => {
  res.render("register", { message: '' });
};

// Handle Register Submission
exports.postRegister = (req, res) => {
  const { username, email, password } = req.body;

  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/) || password.length < 8) {
    return res.render("message", {
      message: "Invalid email or password too short",
    });
  }

  userModel.checkUserExists(email, username, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.render("message", { message: "Registration failed. Try again." });
    }

    if (results.length > 0) {
      return res.render("message", { message: "Email or Username already exists" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Hashing error:", err);
        return res.render("message", { message: "Registration failed. Try again." });
      }

      userModel.createUser(username, email, hashedPassword, (err) => {
        if (err) {
          console.error("Insert error:", err);
          return res.render("message", { message: "Registration failed. Try again." });
        }

        res.render("message", { message: "Registration successful! Please login." });
      });
    });
  });
};

// Show Login Page
exports.getLogin = (req, res) => {
  res.render("login", { message: '' });
};

// Handle Login Submission
exports.postLogin = (req, res) => {
  const { identifier, password, token } = req.body;

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`;

  axios.post(verifyUrl)
    .then(response => {
      if (!response.data.success) {
        return res.render("message", { message: "Invalid reCAPTCHA" });
      }

      userModel.findByEmailOrUsername(identifier, (err, results) => {
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
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
          );

          res.cookie("token", authToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
          });

          res.redirect("/profile");
        });
      });
    })
    .catch(err => {
      console.error("reCAPTCHA error:", err);
      res.render("message", { message: "Login failed" });
    });
};

// Handle Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};
