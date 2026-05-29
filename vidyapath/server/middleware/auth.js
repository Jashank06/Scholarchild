const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — require authentication
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      console.log('Auth: No token provided');
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log('Auth: User not found for token');
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only' });
  }
  next();
};

// Parent only
const parentOnly = (req, res, next) => {
  if (req.user?.role !== 'parent') {
    return res.status(403).json({ success: false, message: 'Parent access only' });
  }
  next();
};

// School / University / Institution only
const institutionOnly = (req, res, next) => {
  if (!['school', 'university', 'service_provider'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Institution access only' });
  }
  next();
};

// Flexible multi-role guard
const multiRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: `Access restricted to: ${roles.join(', ')}` });
    }
    next();
  };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

module.exports = { protect, adminOnly, parentOnly, institutionOnly, multiRole, generateToken };
