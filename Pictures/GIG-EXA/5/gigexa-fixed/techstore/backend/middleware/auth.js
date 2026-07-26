const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Single source of truth for the secret. server.js refuses to boot in
// production if this is unset, so there is no insecure hard-coded fallback here.
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_insecure_secret_change_me';

exports.JWT_SECRET = JWT_SECRET;

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.isActive === false) return res.status(401).json({ message: 'Not authorized' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Attaches req.user if a valid token is present, but never blocks the request.
// Used for endpoints that work for both guests and logged-in customers.
exports.optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive !== false) req.user = user;
  } catch { /* ignore bad token, continue as guest */ }
  next();
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

exports.generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
