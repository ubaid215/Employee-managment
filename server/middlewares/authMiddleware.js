const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

// Protect routes - JWT verification
const protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Get token from headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Get user from DB
    const user = await User.findById(decoded.id).select('+status');
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // 4) Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password was changed recently. Please log in again.', 401));
    }

    // 5) Check account status
    if (user.status === 'suspended') {
      return next(new AppError('Your account has been suspended', 403));
    }
    if (user.status === 'pending') {
      return next(new AppError('Your account is pending approval', 403));
    }

    // 6) Grant access
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Role-based access control
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access only', 403));
  }
  next();
};

module.exports = { protect, isAdmin };