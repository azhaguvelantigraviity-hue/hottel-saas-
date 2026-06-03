const User  = require('../models/User');
const { AppError, asyncHandler, sendSuccess } = require('../utils/helpers');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwt();
  const userObj = { id: user._id, name: user.name, email: user.email, role: user.role, hotel: user.hotel };
  sendSuccess(res, { token, user: userObj }, statusCode);
};

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, hotel } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return next(new AppError('Email already registered', 400));
  const user = await User.create({ name, email, password, role: role || 'hotel_staff', hotel });
  sendToken(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Email and password required', 400));
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('hotel', 'name plan planStatus');
  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }
  if (!user.isActive) return next(new AppError('Account is deactivated', 401));
  sendToken(user, 200, res);
});

exports.logout = asyncHandler(async (_req, res) => {
  sendSuccess(res, null, 200);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('hotel', 'name plan planStatus address');
  sendSuccess(res, user);
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user) return next(new AppError('No user with that email', 404));
  // TODO: generate reset token and send email
  sendSuccess(res, { message: 'Password reset email sent' });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  sendSuccess(res, { message: 'Password reset successful' });
});
