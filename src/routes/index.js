// routes/auth.js
const express = require('express');
const { login, logout, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', authenticateToken, logout);

// Get profile route (protected)
router.get('/profile', authenticateToken, getProfile);

module.exports = router;