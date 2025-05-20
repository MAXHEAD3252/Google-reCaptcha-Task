const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

router.get("/profile", async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token found. Redirecting to login.");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    db.query(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [decoded.id],
      (err, results) => {
        if (err) {
          console.error("DB error:", err);
          return res.render("message", { message: "Database error." });
        }

        if (!results.length) {
          return res.redirect("/login");
        }

        res.render("profile", { user: results[0] });
      }
    );
  } catch (err) {
    console.error("JWT verification error:", err);
    res.render("message", { message: "Session expired. Please login again." });
  }
});

module.exports = router;
