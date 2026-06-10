// src/controllers/operationsController.js
const MenuItem = require('../models/MenuItem');
const Hall = require('../models/Hall');
const EventBooking = require('../models/EventBooking');
const CateringPackage = require('../models/CateringPackage');
const Camera = require('../models/Camera');
const Visitor = require('../models/Visitor');
const SecurityActivity = require('../models/SecurityActivity');
const UserSession = require('../models/UserSession');
const { POSOrder, Housekeeping } = require('../models/Operations');
const { asyncHandler, sendSuccess } = require('../utils/helpers');
const { emitNotification } = require('../utils/notificationHelper');

// ── Housekeeping ──────────────────────────────────────────────

const getHousekeepingTasks = asyncHandler(async (req, res) => {
  const tasks = await Housekeeping.find({ hotel: req.hotelId }).sort('-createdAt');
  sendSuccess(res, tasks);
});

const createHousekeepingTask = asyncHandler(async (req, res) => {
  const { time, ...rest } = req.body;
  const body = {
    ...rest,
    hotel: req.hotelId,
    status: 'pending',
  };
  if (time) {
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    body.scheduledAt = d;
  }
  const task = await Housekeeping.create(body);
  sendSuccess(res, task, 201);
});

const updateHousekeepingTask = asyncHandler(async (req, res) => {
  const task = await Housekeeping.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ success: false, message: 'Housekeeping task not found' });

  // Sync with Room status
  const Room = require('../models/Room');
  if (req.body.status === 'completed' || req.body.status === 'verified') {
    await Room.findOneAndUpdate(
      { hotel: req.hotelId, roomNumber: task.roomNumber },
      { status: 'available', housekeepingStatus: 'clean' }
    );
    await emitNotification(req, {
      hotel: req.hotelId,
      title: 'Cleaning Completed',
      desc: `Housekeeping staff finished cleaning Room ${task.roomNumber}.`,
      type: 'maintenance',
      icon: 'check',
      color: 'var(--green)',
      targetRoles: ['admin', 'manager', 'staff'],
      relatedRoom: task.roomNumber
    });
  } else if (req.body.status === 'in-progress') {
    await Room.findOneAndUpdate(
      { hotel: req.hotelId, roomNumber: task.roomNumber },
      { housekeepingStatus: 'in-progress' }
    );
    await emitNotification(req, {
      hotel: req.hotelId,
      title: 'Cleaning Started',
      desc: `Housekeeping staff started cleaning Room ${task.roomNumber}.`,
      type: 'maintenance',
      icon: 'maintenance',
      color: 'var(--amber)',
      targetRoles: ['admin', 'manager'],
      relatedRoom: task.roomNumber
    });
  }

  sendSuccess(res, task);
});

const verifyHousekeepingTask = asyncHandler(async (req, res) => {
  const task = await Housekeeping.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    { status: 'verified', completedAt: new Date() },
    { new: true }
  );
  if (!task) return res.status(404).json({ success: false, message: 'Housekeeping task not found' });

  // Sync with Room status
  const Room = require('../models/Room');
  await Room.findOneAndUpdate(
    { hotel: req.hotelId, roomNumber: task.roomNumber },
    { status: 'available', housekeepingStatus: 'clean' }
  );

  await emitNotification(req, {
    hotel: req.hotelId,
    title: 'Cleaning Verified',
    desc: `Room ${task.roomNumber} has been inspected and verified clean.`,
    type: 'maintenance',
    icon: 'check',
    color: 'var(--green)',
    targetRoles: ['admin', 'manager', 'staff'],
    relatedRoom: task.roomNumber
  });

  sendSuccess(res, task);
});

const getHousekeepingDashboard = asyncHandler(async (req, res) => {
  const [pending, inProgress, completed, verified] = await Promise.all([
    Housekeeping.countDocuments({ hotel: req.hotelId, status: 'pending' }),
    Housekeeping.countDocuments({ hotel: req.hotelId, status: 'in-progress' }),
    Housekeeping.countDocuments({ hotel: req.hotelId, status: 'completed' }),
    Housekeeping.countDocuments({ hotel: req.hotelId, status: 'verified' }),
  ]);
  sendSuccess(res, { counts: { pending, 'in-progress': inProgress, completed, verified } });
});

// ── Maintenance ──────────────────────────────────────────────

const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const { Maintenance } = require('../models/Operations');
  const requests = await Maintenance.find({ hotel: req.hotelId }).sort('-createdAt');
  sendSuccess(res, requests);
});

const createMaintenanceRequest = asyncHandler(async (req, res) => {
  const { Maintenance } = require('../models/Operations');
  const reqCount = await Maintenance.countDocuments({ hotel: req.hotelId });
  const ticketId = `MNT-${String(reqCount + 1001).padStart(4, '0')}`;
  const request = await Maintenance.create({ ...req.body, ticketId, hotel: req.hotelId });
  sendSuccess(res, request, 201);
});

const updateMaintenanceRequest = asyncHandler(async (req, res) => {
  const { Maintenance } = require('../models/Operations');
  const request = await Maintenance.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!request) return res.status(404).json({ success: false, message: 'Maintenance request not found' });
  sendSuccess(res, request);
});

// ── Restaurant POS – Menu Items ──────────────────────────────

const getMenuItems = asyncHandler(async (req, res) => {
  const filter = { hotel: req.hotelId };
  if (req.query.category) filter.category = req.query.category;
  const items = await MenuItem.find(filter).sort('category name');
  sendSuccess(res, items);
});

const createMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.create({ ...req.body, hotel: req.hotelId });
  sendSuccess(res, item, 201);
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
  sendSuccess(res, item);
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
  sendSuccess(res, null, 204);
});

// ── Restaurant POS – Orders ──────────────────────────────────

const getPOSOrders = asyncHandler(async (req, res) => {
  const orders = await POSOrder.find({ hotel: req.hotelId }).sort('-createdAt');
  sendSuccess(res, orders);
});

const createPOSOrder = asyncHandler(async (req, res) => {
  const { table, type, items } = req.body;
  
  if (type === 'room-service') {
    const Room = require('../models/Room');
    const Booking = require('../models/Booking');
    const room = await Room.findOne({ hotel: req.hotelId, roomNumber: table });
    if (!room) {
      return res.status(400).json({ success: false, message: 'This room is not currently occupied.' });
    }
    const activeBooking = await Booking.findOne({
      hotel: req.hotelId,
      room: room._id,
      status: { $in: ['confirmed', 'checked_in'] }
    });
    if (!activeBooking) {
      return res.status(400).json({ success: false, message: 'This room is not currently occupied.' });
    }
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  for (const item of items) {
    if (item.menuItem) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (menuItem && menuItem.stock > 0) {
        const remaining = menuItem.stock - item.qty;
        if (remaining < 0) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${menuItem.name}` });
        }
        await MenuItem.findByIdAndUpdate(item.menuItem, { stock: remaining });
      }
    }
  }

  const order = await POSOrder.create({
    hotel: req.hotelId,
    table, type,
    items: items.map(i => ({
      menuItem: i.menuItem || undefined,
      name: i.name,
      qty: i.qty,
      price: i.price,
    })),
    subtotal, tax, total,
    status: 'pending',
  });

  if (req.app.get('io')) {
    req.app.get('io').to(req.hotelId.toString()).emit('posOrderUpdated', order);
  }

  sendSuccess(res, order, 201);
});

const updatePOSOrder = asyncHandler(async (req, res) => {
  const order = await POSOrder.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (req.app.get('io')) {
    req.app.get('io').to(req.hotelId.toString()).emit('posOrderUpdated', order);
  }

  sendSuccess(res, order);
});

const getPOSSummary = asyncHandler(async (req, res) => {
  const [pending, preparing, delivered, cancelled] = await Promise.all(
    ['pending', 'preparing', 'delivered', 'cancelled'].map(status =>
      POSOrder.countDocuments({ hotel: req.hotelId, status })
    )
  );
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayRevenue = await POSOrder.aggregate([
    { $match: { hotel: req.hotelId, createdAt: { $gte: todayStart }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  sendSuccess(res, {
    counts: { pending, preparing, delivered, cancelled },
    todayRevenue: todayRevenue[0]?.total || 0,
  });
});

// ── Event Halls ─────────────────────────────────────────────

const getHalls = asyncHandler(async (req, res) => {
  const halls = await Hall.find({ hotel: req.hotelId }).sort('name');
  sendSuccess(res, halls);
});

const createHall = asyncHandler(async (req, res) => {
  const hall = await Hall.create({ ...req.body, hotel: req.hotelId });
  sendSuccess(res, hall, 201);
});

const updateHall = asyncHandler(async (req, res) => {
  const hall = await Hall.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
  sendSuccess(res, hall);
});

const deleteHall = asyncHandler(async (req, res) => {
  const hall = await Hall.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
  sendSuccess(res, null, 204);
});

// ── Event Bookings ─────────────────────────────────────────

const getEventBookings = asyncHandler(async (req, res) => {
  const bookings = await EventBooking.find({ hotel: req.hotelId }).sort('-date');
  sendSuccess(res, bookings);
});

const createEventBooking = asyncHandler(async (req, res) => {
  const { eventName, hall, clientName, date, guests, hallRate, cateringPrice, ...rest } = req.body;
  const totalAmount = (hallRate || 0) + (cateringPrice || 0) * guests;
  const booking = await EventBooking.create({
    ...rest, eventName, hall, clientName, date, guests,
    hallRate: hallRate || 0,
    cateringPrice: cateringPrice || 0,
    totalAmount,
    hotel: req.hotelId,
  });
  sendSuccess(res, booking, 201);
});

const updateEventBooking = asyncHandler(async (req, res) => {
  const booking = await EventBooking.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!booking) return res.status(404).json({ success: false, message: 'Event booking not found' });
  sendSuccess(res, booking);
});

const deleteEventBooking = asyncHandler(async (req, res) => {
  const booking = await EventBooking.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!booking) return res.status(404).json({ success: false, message: 'Event booking not found' });
  sendSuccess(res, null, 204);
});

// ── Catering Packages ──────────────────────────────────────

const getCateringPackages = asyncHandler(async (req, res) => {
  const packages = await CateringPackage.find({ hotel: req.hotelId, isActive: true }).sort('name');
  sendSuccess(res, packages);
});

const createCateringPackage = asyncHandler(async (req, res) => {
  const pkg = await CateringPackage.create({ ...req.body, hotel: req.hotelId });
  sendSuccess(res, pkg, 201);
});

const updateCateringPackage = asyncHandler(async (req, res) => {
  const pkg = await CateringPackage.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!pkg) return res.status(404).json({ success: false, message: 'Catering package not found' });
  sendSuccess(res, pkg);
});

const deleteCateringPackage = asyncHandler(async (req, res) => {
  const pkg = await CateringPackage.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!pkg) return res.status(404).json({ success: false, message: 'Catering package not found' });
  sendSuccess(res, null, 204);
});

// ── Reports ──────────────────────────────────────────────────

const getRevenueReport = asyncHandler(async (req, res) => {
  const Invoice = require('../models/Invoice');
  const report = await Invoice.aggregate([
    { $match: { hotel: req.hotelId, status: { $in: ['issued', 'paid'] } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" } } },
    { $sort: { _id: 1 } }
  ]);
  sendSuccess(res, report);
});

const getOccupancyReport = asyncHandler(async (req, res) => {
  const Booking = require('../models/Booking');
  const Room = require('../models/Room');
  const totalRooms = await Room.countDocuments({ hotel: req.hotelId });
  sendSuccess(res, { totalRooms, occupancyRate: totalRooms > 0 ? 50 : 0, message: "Occupancy rate simulation" });
});

const getBookingSourceReport = asyncHandler(async (req, res) => {
  const Booking = require('../models/Booking');
  const sources = await Booking.aggregate([
    { $match: { hotel: req.hotelId } },
    { $group: { _id: "$source", count: { $sum: 1 } } }
  ]);
  sendSuccess(res, sources);
});

const getRevenueAIInsights = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    insights: [
      "Revenue is up 15% compared to last month.",
      "Direct bookings have increased, saving on commission fees.",
      "Consider dynamic pricing for upcoming weekend."
    ]
  });
});

// ── Security – Cameras ─────────────────────────────────────

const getCameras = asyncHandler(async (req, res) => {
  const cameras = await Camera.find({ hotel: req.hotelId }).sort('location');
  sendSuccess(res, cameras);
});

const createCamera = asyncHandler(async (req, res) => {
  const camera = await Camera.create({ ...req.body, hotel: req.hotelId });
  sendSuccess(res, camera, 201);
});

const updateCamera = asyncHandler(async (req, res) => {
  const camera = await Camera.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!camera) return res.status(404).json({ success: false, message: 'Camera not found' });
  sendSuccess(res, camera);
});

const deleteCamera = asyncHandler(async (req, res) => {
  const camera = await Camera.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!camera) return res.status(404).json({ success: false, message: 'Camera not found' });
  sendSuccess(res, null, 204);
});

// ── Security – Visitors ─────────────────────────────────────

const getVisitors = asyncHandler(async (req, res) => {
  const visitors = await Visitor.find({ hotel: req.hotelId }).sort('-createdAt');
  sendSuccess(res, visitors);
});

const createVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.create({ ...req.body, hotel: req.hotelId });
  sendSuccess(res, visitor, 201);
});

const updateVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
  sendSuccess(res, visitor);
});

const deleteVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
  sendSuccess(res, null, 204);
});

// ── Security – Activity Log ─────────────────────────────────

const getSecurityActivity = asyncHandler(async (req, res) => {
  const filter = { hotel: req.hotelId };
  if (req.query.type) filter.type = req.query.type;
  const activities = await SecurityActivity.find(filter).sort('-createdAt');
  sendSuccess(res, activities);
});

const createSecurityActivity = asyncHandler(async (req, res) => {
  const activity = await SecurityActivity.create({ ...req.body, hotel: req.hotelId });
  sendSuccess(res, activity, 201);
});

// ── Security – Sessions ─────────────────────────────────────

const getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await UserSession.find({ hotel: req.hotelId }).sort('-current lastActive');
  sendSuccess(res, sessions);
});

const revokeSession = asyncHandler(async (req, res) => {
  const session = await UserSession.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId, current: false });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found or cannot be revoked' });
  sendSuccess(res, null, 204);
});

// ── Channel Manager ─────────────────────────────────────────

const getChannelStatus = asyncHandler(async (req, res) => {
  sendSuccess(res, []);
});

const syncChannels = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Sync initiated' });
});

module.exports = {
  getHousekeepingTasks, createHousekeepingTask, updateHousekeepingTask,
  verifyHousekeepingTask, getHousekeepingDashboard,
  getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
  getPOSOrders, createPOSOrder, updatePOSOrder, getPOSSummary,
  getHalls, createHall, updateHall, deleteHall,
  getEventBookings, createEventBooking, updateEventBooking, deleteEventBooking,
  getCateringPackages, createCateringPackage, updateCateringPackage, deleteCateringPackage,
  getCameras, createCamera, updateCamera, deleteCamera,
  getVisitors, createVisitor, updateVisitor, deleteVisitor,
  getSecurityActivity, createSecurityActivity,
  getUserSessions, revokeSession,
  getRevenueReport, getOccupancyReport, getBookingSourceReport, getRevenueAIInsights,
  getChannelStatus, syncChannels,
};
