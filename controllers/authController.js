const { login } = require('../middleware/auth');

exports.loginUser = (req, res) => {
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
};

exports.verifyToken = (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
};

exports.logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};