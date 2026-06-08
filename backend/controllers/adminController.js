const Hotel   = require('../models/Hotel');
const Branch  = require('../models/Branch');
const User    = require('../models/User');
const Booking = require('../models/Booking');
const Room    = require('../models/Room');
const AuditLog = require('../models/AuditLog');
const Role    = require('../models/Role');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

// Helper to create an audit log
const createAuditLog = async (req, action, target = '', details = '', status = 'success') => {
  try {
    await AuditLog.create({
      action,
      target,
      details,
      user: req.user ? (req.user.name || req.user.email) : 'System',
      ip: req.ip || req.connection.remoteAddress,
      status
    });
  } catch (err) {
    console.error('Failed to create audit log', err);
  }
};

exports.getDashboard = asyncHandler(async (_req, res) => {
  const [totalHotels, activeHotels, totalUsers, totalRooms] = await Promise.all([
    Hotel.countDocuments(),
    Hotel.countDocuments({ planStatus: 'active' }),
    User.countDocuments({ role: { $ne: 'platform_admin' } }),
    Room.countDocuments()
  ]);

  const hotels = await Hotel.find().select('plan planStatus');
  const mrr = hotels.reduce((sum, h) => {
    const prices = { starter: 49, professional: 149, enterprise: 399 };
    return h.planStatus === 'active' ? sum + (prices[h.plan] || 0) : sum;
  }, 0);

  const planBreakdown = await Hotel.aggregate([
    { $group: { _id: '$plan', count: { $sum: 1 } } }
  ]);
  const breakdown = { starter: 0, professional: 0, enterprise: 0 };
  planBreakdown.forEach(p => { breakdown[p._id] = p.count; });

  sendSuccess(res, { totalHotels, activeHotels, totalUsers, totalRooms, mrr, planBreakdown: breakdown });
});

exports.getPlatformStats = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find().select('plan planStatus');
  const mrr = hotels.reduce((sum, h) => {
    const prices = { starter: 49, professional: 149, enterprise: 399 };
    return h.planStatus === 'active' ? sum + (prices[h.plan] || 0) : sum;
  }, 0);
  sendSuccess(res, { mrr, totalHotels: hotels.length });
});

exports.getAllHotels = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find().populate('owner', 'name email').sort('-createdAt');
  sendSuccess(res, hotels, 200, { count: hotels.length });
});

exports.getHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id).populate('owner', 'name email');
  if (!hotel) return next(new (require('../utils/helpers').AppError)('Hotel not found', 404));
  sendSuccess(res, hotel);
});

exports.createHotel = asyncHandler(async (req, res) => {
  const {
    name, hotelCode, email, phone, website, address, plan, planStatus, totalRooms,
    adminEmail, adminPassword, managerName, managerEmail, managerPhone, managerPassword, managerUsername
  } = req.body;

  // Create Hotel
  const hotel = await Hotel.create({
    name,
    hotelCode: hotelCode || `HTL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    email: email || adminEmail || managerEmail,
    phone,
    website,
    address,
    plan,
    planStatus,
    totalRooms: totalRooms || req.body.rooms || 0,
    adminCredentials: {
      email: managerEmail || adminEmail || '',
      password: managerPassword || adminPassword || '',
      username: managerUsername || managerEmail || adminEmail || ''
    }
  });

  // Extract manager credentials
  const mEmail = managerEmail || adminEmail;
  const mPassword = managerPassword || adminPassword;
  const mUsername = managerUsername || mEmail;

  if (mEmail && mPassword) {
    let manager = await User.findOne({ email: mEmail });
    if (manager) {
      manager.name = managerName || `${name} Manager`;
      manager.username = mUsername;
      manager.password = mPassword;
      manager.role = 'hotel_admin';
      manager.hotel = hotel._id;
      if (managerPhone) manager.phone = managerPhone;
      await manager.save();
    } else {
      manager = await User.create({
        name: managerName || `${name} Manager`,
        username: mUsername,
        email: mEmail,
        password: mPassword,
        phone: managerPhone,
        role: 'hotel_admin',
        hotel: hotel._id
      });
    }

    hotel.owner = manager._id;
    await hotel.save();
  }

  await createAuditLog(req, 'Created Hotel', hotel.name, `Plan: ${plan}`, 'success');
  sendSuccess(res, hotel, 201);
});

exports.updateHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!hotel) return next(new (require('../utils/helpers').AppError)('Hotel not found', 404));
  await createAuditLog(req, 'Updated Hotel', hotel.name, 'Hotel details updated', 'success');
  sendSuccess(res, hotel);
});

exports.updateSubscription = asyncHandler(async (req, res, next) => {
  const { plan, planStatus } = req.body;
  const hotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    { plan, planStatus, subscriptionStart: new Date(), nextPaymentAt: new Date(Date.now() + 30 * 86400000) },
    { new: true }
  );
  if (!hotel) return next(new (require('../utils/helpers').AppError)('Hotel not found', 404));
  await createAuditLog(req, 'Updated Subscription', hotel.name, `Changed to ${plan} (${planStatus})`, 'success');
  sendSuccess(res, hotel);
});

exports.deleteHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.id);
  if (!hotel) return next(new (require('../utils/helpers').AppError)('Hotel not found', 404));
  await createAuditLog(req, 'Deleted Hotel', hotel.name, 'Hotel permanently deleted', 'warning');
  sendSuccess(res, null, 200);
});

exports.getPlatformRevenue = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find({ planStatus: 'active' }).select('plan');
  const prices = { starter: 49, professional: 149, enterprise: 399 };
  const mrr = hotels.reduce((s, h) => s + (prices[h.plan] || 0), 0);
  sendSuccess(res, { mrr, hotelCount: hotels.length });
});

exports.getAuditLogs = asyncHandler(async (_req, res) => {
  const logs = await AuditLog.find().sort('-createdAt');
  sendSuccess(res, logs);
});

exports.getRenewalAlerts = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find().populate('owner', 'name email');
  const now = new Date();
  
  const alerts = hotels.map(hotel => {
    let type = 'active';
    let daysLeft = 0;
    
    if (hotel.planStatus === 'trial') {
      const trialStart = new Date(hotel.subscriptionStart || hotel.createdAt);
      const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 day trial
      daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) {
        type = 'critical'; // expired trial
      } else if (daysLeft <= 3) {
        type = 'warning';
      } else {
        type = 'upcoming'; // just showing it's on trial
      }
    } else if (hotel.planStatus === 'active') {
      if (hotel.nextPaymentAt) {
        daysLeft = Math.ceil((new Date(hotel.nextPaymentAt) - now) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) type = 'critical'; // expired active sub
        else if (daysLeft <= 7) type = 'warning';
        else if (daysLeft <= 30) type = 'upcoming';
      } else {
        // no next payment set, assume 30 days from start
        const subStart = new Date(hotel.subscriptionStart || hotel.createdAt);
        const subEnd = new Date(subStart.getTime() + 30 * 24 * 60 * 60 * 1000);
        daysLeft = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) type = 'critical';
        else if (daysLeft <= 7) type = 'warning';
        else if (daysLeft <= 30) type = 'upcoming';
      }
    } else {
      type = 'critical'; // cancelled or suspended
    }
    
    return {
      _id: hotel._id,
      name: hotel.name,
      owner: hotel.owner,
      plan: hotel.plan,
      planStatus: hotel.planStatus,
      daysLeft,
      type
    };
  });
  
  // Filter out active hotels that are more than 30 days out from renewal
  const filteredAlerts = alerts.filter(a => a.type !== 'active' && a.daysLeft <= 30);
  
  // Sort: Critical first (by most negative days), then Warning, then Upcoming
  filteredAlerts.sort((a, b) => a.daysLeft - b.daysLeft);
  
  sendSuccess(res, filteredAlerts, 200, { count: filteredAlerts.length });
});

exports.getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: { $ne: 'platform_admin' } }).populate('hotel', 'name').sort('-createdAt');
  sendSuccess(res, users, 200, { count: users.length });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, hotel } = req.body;
  if (!name || !email || !password) {
    return next(new (require('../utils/helpers').AppError)('Please provide name, email and password', 400));
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new (require('../utils/helpers').AppError)('Email already exists', 400));
  }

  const user = await User.create({ name, email, password, role: role || 'hotel_staff', hotel });
  await createAuditLog(req, 'Created Account', user.email, `Role: ${user.role}`, 'success');
  
  // Return user without password
  const userWithoutPassword = await User.findById(user._id).populate('hotel', 'name');
  sendSuccess(res, userWithoutPassword, 201);
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, hotel, isActive, password } = req.body;
  
  let user = await User.findById(req.params.id);
  if (!user) return next(new (require('../utils/helpers').AppError)('User not found', 404));
  
  user.name = name || user.name;
  user.email = email || user.email;
  if (role) user.role = role;
  if (hotel !== undefined) user.hotel = hotel || null;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password; // pre-save hook will hash it
  
  await user.save();
  await createAuditLog(req, 'Updated Account', user.email, `Status updated`, 'success');
  
  const updatedUser = await User.findById(user._id).populate('hotel', 'name');
  sendSuccess(res, updatedUser);
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new (require('../utils/helpers').AppError)('User not found', 404));
  
  await createAuditLog(req, 'Deleted Account', user.email, 'Account deleted permanently', 'warning');
  sendSuccess(res, null, 200);
});

// Branch Controllers
exports.getAllBranches = asyncHandler(async (_req, res) => {
  const branches = await Branch.find().sort('-createdAt');
  sendSuccess(res, branches, 200, { count: branches.length });
});

// Role Controllers
exports.getRoles = asyncHandler(async (_req, res) => {
  const roles = await Role.find().sort('createdAt');
  sendSuccess(res, roles);
});

exports.createRole = asyncHandler(async (req, res, next) => {
  const { name, description, permissions } = req.body;
  if (!name) return next(new (require('../utils/helpers').AppError)('Role name is required', 400));
  
  const existing = await Role.findOne({ name });
  if (existing) return next(new (require('../utils/helpers').AppError)('Role already exists', 400));
  
  const role = await Role.create({ name, description, permissions });
  await createAuditLog(req, 'Created Role', role.name, 'success');
  sendSuccess(res, role, 201);
});

exports.updateRole = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  if (!role) return next(new (require('../utils/helpers').AppError)('Role not found', 404));
  
  if (role.isSystem && req.body.name && req.body.name !== role.name) {
    return next(new (require('../utils/helpers').AppError)('Cannot rename system roles', 400));
  }
  
  const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  await createAuditLog(req, 'Updated Role', updatedRole.name, 'success');
  sendSuccess(res, updatedRole);
});

exports.deleteRole = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  if (!role) return next(new (require('../utils/helpers').AppError)('Role not found', 404));
  
  if (role.isSystem) {
    return next(new (require('../utils/helpers').AppError)('Cannot delete system roles', 400));
  }
  
  await Role.findByIdAndDelete(req.params.id);
  await createAuditLog(req, 'Deleted Role', role.name, 'warning');
  sendSuccess(res, null, 200);
});

exports.createBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.create(req.body);
  await createAuditLog(req, 'Created Branch', branch.name, `Under hotel: ${branch.hotelName}`, 'success');
  sendSuccess(res, branch, 201);
});

exports.updateBranch = asyncHandler(async (req, res, next) => {
  const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!branch) return next(new (require('../utils/helpers').AppError)('Branch not found', 404));
  await createAuditLog(req, 'Updated Branch', branch.name, 'Branch details updated', 'success');
  sendSuccess(res, branch);
});

exports.deleteBranch = asyncHandler(async (req, res, next) => {
  const branch = await Branch.findByIdAndDelete(req.params.id);
  if (!branch) return next(new (require('../utils/helpers').AppError)('Branch not found', 404));
  await createAuditLog(req, 'Deleted Branch', branch.name, 'Branch permanently deleted', 'warning');
  sendSuccess(res, null, 200);
});
