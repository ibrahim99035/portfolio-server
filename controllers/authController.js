const express = require('express');
const { login, authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = login(username, password);

    if (result.success) {
      res.json({
        message: 'Login successful',
        token: result.token,
        user: result.user
      });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify - Verify token validity
router.post('/verify', authenticate, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// POST /api/auth/logout - Optional logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;