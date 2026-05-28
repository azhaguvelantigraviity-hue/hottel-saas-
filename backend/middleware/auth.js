const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Hotel   = require('../models/Hotel');
const { AppError, asyncHandler } = require('../utils/helpers');

// Verify JWT and attach user to req
exports.protect = asyncHandler(async (req, _res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('Not authenticated', 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user    = await User.findById(decoded.id).select('-password');
  if (!user) return next(new AppError('User no longer exists', 401));

  req.user = user;
  next();
});

// Restrict to platform_admin
exports.platformAdmin = (req, _res, next) => {
  if (req.user.role !== 'platform_admin') {
    return next(new AppError('Platform admin access required', 403));
  }
  next();
};

// Restrict to hotel_admin within the same hotel
exports.hotelAdmin = (req, _res, next) => {
  if (!['hotel_admin', 'platform_admin'].includes(req.user.role)) {
    return next(new AppError('Hotel admin access required', 403));
  }
  next();
};

// Scope all hotel requests to the user's hotel
exports.scopeToHotel = asyncHandler(async (req, _res, next) => {
  if (req.user.role === 'platform_admin') return next(); // platform admin can access all
  if (!req.user.hotel) return next(new AppError('No hotel associated with this account', 403));
  req.hotelId = req.user.hotel;
  next();
});

// Generic role check
exports.authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(`Role '${req.user.role}' is not authorized`, 403));
  }
  next();
};
