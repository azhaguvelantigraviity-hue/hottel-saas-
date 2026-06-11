const User  = require('../models/User');
const { AppError, asyncHandler, sendSuccess } = require('../utils/helpers');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwt();
  const userObj = { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, hotel: user.hotel };
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

  // Heal missing department from Employee collection
  if (user.role === 'hotel_staff' && (!user.department || user.department === 'None')) {
    const { Employee } = require('../models/Operations');
    const emp = await Employee.findOne({ email: user.email });
    if (emp && emp.department) {
      user.department = emp.department === 'Front Office' ? 'Front Desk' : emp.department;
      await user.save({ validateBeforeSave: false });
    }
  }

  sendToken(user, 200, res);
});

exports.logout = asyncHandler(async (_req, res) => {
  sendSuccess(res, null, 200);
});

const Registration = require('../models/Registration');

exports.registerHotel = asyncHandler(async (req, res, next) => {
  const { hotelName, ownerName, email, phone, address, city, totalRooms, plan, password } = req.body;
  if (!password) return next(new AppError('Password is required', 400));
  
  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('Email already registered as a user', 400));
  
  const existingHotel = await require('../models/Hotel').findOne({ email });
  if (existingHotel) return next(new AppError('A hotel with this email already exists', 400));

  const existingReg = await Registration.findOne({ email });
  if (existingReg) return next(new AppError('A registration with this email is already pending', 400));

  const documentPath = req.file ? req.file.filename : null;

  const registration = await Registration.create({
    hotelName,
    ownerName,
    email,
    phone,
    address,
    city,
    totalRooms,
    plan: plan || 'starter',
    password,
    document: documentPath,
    status: 'pending'
  });

  try {
    const AdminNotification = require('../models/AdminNotification');
    const adminNotif = await AdminNotification.create({
      type: 'system',
      title: 'New Hotel Registration',
      message: `${hotelName} (${ownerName}) has requested registration for the ${plan} plan.`,
      status: 'unread',
      metadata: { registrationId: registration._id }
    });

    const io = req.app.get('io');
    if (io) {
      io.to('adminRoom').emit('newAdminNotification', adminNotif);
    }
  } catch (err) {
    console.error('Failed to send admin notification for registration:', err);
  }

  sendSuccess(res, { message: 'Pending Approval + Free Trial Requested.', registration }, 201);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('hotel', 'name plan planStatus address trialStartDate trialEndDate paymentStatus');
  
  if (user && user.role === 'hotel_staff' && (!user.department || user.department === 'None')) {
    const { Employee } = require('../models/Operations');
    const emp = await Employee.findOne({ email: user.email });
    if (emp && emp.department) {
      user.department = emp.department === 'Front Office' ? 'Front Desk' : emp.department;
      await user.save({ validateBeforeSave: false });
    }
  }

  let isTrialExpired = false;
  if (user && user.hotel && user.hotel.planStatus === 'trial' && user.hotel.trialEndDate) {
    if (Date.now() > new Date(user.hotel.trialEndDate).getTime()) {
      isTrialExpired = true;
    }
  }
  
  const userObj = user ? user.toObject() : null;
  if (userObj) userObj.isTrialExpired = isTrialExpired;
  
  sendSuccess(res, userObj);
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
