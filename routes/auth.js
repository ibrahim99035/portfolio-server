const express = require('express');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/login
router.post('/login', authController.loginUser);

// POST /api/auth/verify - Verify token validity
router.post('/verify', authenticate, authController.verifyToken);

// POST /api/auth/logout - Optional logout endpoint (client-side token removal)
router.post('/logout', authController.logoutUser);

module.exports = router;