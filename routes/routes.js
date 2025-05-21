const express = require('express');
const router = express.Router();

// Modular route imports
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');

// Mount modular routes
router.use('/', authRoutes);
router.use('/', profileRoutes);

module.exports = router;
