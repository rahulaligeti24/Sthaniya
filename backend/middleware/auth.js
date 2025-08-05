const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');
    
    // Check if no token
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token, authorization denied'
      });
    }
    
    // Extract token from Bearer format
    const actualToken = token.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || 'sthaniya-secret-key-2024');
    
    // Try both common JWT payload structures
    const userId = decoded.userId || decoded.id || decoded._id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Invalid token structure'
      });
    }
    
    // Get user from token
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Token is not valid - user not found'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    
    res.status(401).json({
      error: 'Token is not valid'
    });
  }
};

module.exports = auth;