const Hotel   = require('../models/Hotel');
const User    = require('../models/User');
const Booking = require('../models/Booking');
const Room    = require('../models/Room');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

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
    name, email, phone, website, address, plan, planStatus, totalRooms,
    adminEmail, adminPassword, managerEmail, managerPassword
  } = req.body;

  // Create Hotel
  const hotel = await Hotel.create({
    name,
    email: email || adminEmail || managerEmail,
    phone,
    website,
    address,
    plan,
    planStatus,
    totalRooms: totalRooms || req.body.rooms || 0,
    adminCredentials: {
      email: managerEmail || adminEmail || '',
      password: managerPassword || adminPassword || ''
    }
  });

  // Extract manager credentials
  const mEmail = managerEmail || adminEmail;
  const mPassword = managerPassword || adminPassword;

  if (mEmail && mPassword) {
    // Find existing user or create a new one to prevent E11000 dup key errors
    let manager = await User.findOne({ email: mEmail });
    if (manager) {
      manager.name = `${name} Manager`;
      manager.password = mPassword;
      manager.role = 'hotel_admin';
      manager.hotel = hotel._id;
      await manager.save();
    } else {
      manager = await User.create({
        name: `${name} Manager`,
        email: mEmail,
        password: mPassword,
        role: 'hotel_admin',
        hotel: hotel._id
      });
    }

    hotel.owner = manager._id;
    await hotel.save();
  }

  sendSuccess(res, hotel, 201);
});

exports.updateHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!hotel) return next(new (require('../utils/helpers').AppError)('Hotel not found', 404));
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
  sendSuccess(res, hotel);
});

exports.deleteHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.id);
  if (!hotel) return next(new (require('../utils/helpers').AppError)('Hotel not found', 404));
  sendSuccess(res, null, 200);
});

exports.getPlatformRevenue = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find({ planStatus: 'active' }).select('plan');
  const prices = { starter: 49, professional: 149, enterprise: 399 };
  const mrr = hotels.reduce((s, h) => s + (prices[h.plan] || 0), 0);
  sendSuccess(res, { mrr, hotelCount: hotels.length });
});

exports.getAuditLogs = asyncHandler(async (_req, res) => {
  const logs = []; // TODO: integrate AuditLog model
  sendSuccess(res, logs);
});

exports.getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: { $ne: 'platform_admin' } }).populate('hotel', 'name').sort('-createdAt');
  sendSuccess(res, users, 200, { count: users.length });
});
