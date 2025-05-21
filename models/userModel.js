const db = require('../config/db');

// Find user by email or username
exports.findByEmailOrUsername = (identifier, callback) => {
  const query = 'SELECT * FROM users WHERE email = ? OR username = ?';
  db.query(query, [identifier, identifier], callback);
};

// Check if user already exists
exports.checkUserExists = (email, username, callback) => {
  const query = 'SELECT * FROM users WHERE email = ? OR username = ?';
  db.query(query, [email, username], callback);
};

// Create a new user
exports.createUser = (username, email, hashedPassword, callback) => {
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, hashedPassword], callback);
};

// Get user profile by ID
exports.getUserById = (userId, callback) => {
  const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
  db.query(query, [userId], callback);
};
