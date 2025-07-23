const jwt = require('jsonwebtoken');

// Simple authentication middleware using username/password from .env
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the user matches our admin credentials
    if (decoded.username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return authMiddleware.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Login function to generate JWT token
const login = (username, password) => {
  // Check credentials against environment variables
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Generate JWT token
    const token = jwt.sign(
      { 
        username: username,
        role: 'admin',
        iat: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return {
      success: true,
      token,
      user: {
        username,
        role: 'admin'
      }
    };
  }
  
  return {
    success: false,
    error: 'Invalid credentials'
  };
};

// Optional middleware for routes that can work with or without auth
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

module.exports = {
  authenticate,
  login,
  optionalAuth
};