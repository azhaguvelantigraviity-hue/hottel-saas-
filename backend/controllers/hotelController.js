// src/controllers/hotelController.js
const { Employee } = require('../models/Operations');
const Room    = require('../models/Room');
const Booking = require('../models/Booking');
const Guest   = require('../models/Guest');
const CabBooking = require('../models/CabBooking');
const TravelPackage = require('../models/TravelPackage');
const { AppError, sendSuccess } = require('../utils/helpers');
const catchAsync = require('../utils/helpers').catchAsync || ((fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
});

// ── Helpers ────────────────────────────────────────────────────
const hotelFilter = (req) => req.hotelId ? { hotel: req.hotelId } : {};
const oneFilter   = (req)  => req.hotelId ? { hotel: req.hotelId, _id: req.params.id } : { _id: req.params.id };
const findOrCreateGuest = async (body) => {
  if (!body.guest) return null;
  // guest is already an ObjectId
  if (typeof body.guest === 'string' && /^[0-9a-fA-F]{24}$/.test(body.guest)) return body.guest;
  const name = (body.guestName || body.guest || '').trim();
  const parts = name.split(/\s+/);
  const firstName = parts[0] || 'Unknown';
  const lastName  = parts.slice(1).join(' ') || '';
  let guest = await Guest.findOne({ hotel: body.hotel, firstName, lastName });
  if (!guest) {
    guest = await Guest.create({
      hotel: body.hotel, firstName, lastName,
      phone: body.phone || '', email: body.email || '',
    });
  }
  return guest._id;
};
const resolveRoom = async (body) => {
  if (!body.room) return null;
  if (typeof body.room === 'string' && /^[0-9a-fA-F]{24}$/.test(body.room)) return body.room;
  const num = String(body.room).split(' – ')[0].trim();
  const room = await Room.findOne({ hotel: body.hotel, roomNumber: num });
  if (!room) throw new AppError(`Room "${num}" not found`, 404);
  return room._id;
};
const populateBooking = (q) => q.populate('guest', 'firstName lastName phone email').populate('room', 'roomNumber type');

// ── Rooms ──────────────────────────────────────────────────────
const getRooms = catchAsync(async (req, res) => {
  const rooms = await Room.find(hotelFilter(req)).sort('roomNumber');
  sendSuccess(res, rooms);
});
const getRoom = catchAsync(async (req, res) => {
  const room = await Room.findOne(oneFilter(req));
  if (!room) throw new AppError('Room not found', 404);
  sendSuccess(res, room);
});
const createRoom = catchAsync(async (req, res) => {
  const body = { ...req.body, hotel: req.hotelId || req.body.hotel };
  const room = await Room.create(body);
  res.status(201).json({ success: true, data: room });
});
const updateRoom = catchAsync(async (req, res) => {
  const room = await Room.findOneAndUpdate(oneFilter(req), req.body, { new: true, runValidators: true });
  if (!room) throw new AppError('Room not found', 404);
  sendSuccess(res, room);
});
const deleteRoom = catchAsync(async (req, res) => {
  const room = await Room.findOneAndDelete(oneFilter(req));
  if (!room) throw new AppError('Room not found', 404);
  sendSuccess(res, room);
});
const updateRoomHousekeeping = catchAsync(async (req, res) => {
  const room = await Room.findOneAndUpdate(oneFilter(req), { housekeepingStatus: req.body.housekeepingStatus }, { new: true });
  if (!room) throw new AppError('Room not found', 404);
  sendSuccess(res, room);
});
const checkAvailability = catchAsync(async (req, res) => {
  const { checkIn, checkOut, type } = req.query;
  const filter = hotelFilter(req);
  filter.status = { $in: ['available', 'reserved'] };
  if (type) filter.type = type;
  const rooms = await Room.find(filter).sort('roomNumber');
  // Exclude rooms with overlapping confirmed/checked-in bookings
  if (checkIn && checkOut) {
    const busy = await Booking.find({
      hotel: req.hotelId || req.query.hotel,
      status: { $in: ['confirmed', 'checked_in'] },
      $or: [
        { checkIn:  { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
        { checkOut: { $gt: new Date(checkIn),  $lte: new Date(checkOut) } },
        { checkIn:  { $lte: new Date(checkIn) }, checkOut: { $gte: new Date(checkOut) } },
      ],
    }).distinct('room');
    return sendSuccess(res, rooms.filter(r => !busy.some(b => b.equals(r._id))));
  }
  sendSuccess(res, rooms);
});

// ── Bookings ────────────────────────────────────────────────────
const getBookings = catchAsync(async (req, res) => {
  const { status, date } = req.query;
  const filter = hotelFilter(req);
  if (status && status !== 'all') filter.status = status;
  if (date) {
    const d = new Date(date);
    const next = new Date(d.getTime() + 86400000);
    filter.checkIn = { $gte: d, $lt: next };
  }
  const bookings = await populateBooking(Booking.find(filter).sort('-createdAt'));
  sendSuccess(res, bookings);
});
const getBooking = catchAsync(async (req, res) => {
  const filter = hotelFilter(req);
  // Support lookup by both _id and bookingId (e.g. BK-1003)
  filter.$or = [
    { _id: req.params.id },
    { bookingId: req.params.id },
  ];
  const booking = await populateBooking(Booking.findOne(filter));
  if (!booking) throw new AppError('Booking not found', 404);
  sendSuccess(res, booking);
});
const createBooking = catchAsync(async (req, res) => {
  const body = { ...req.body, hotel: req.hotelId || req.body.hotel };
  // Map frontend field names to schema
  if (body.amount && !body.totalAmount) body.totalAmount = body.amount;
  if (body.id && !body.bookingId) body.bookingId = body.id;
  delete body.amount; delete body.id;
  // Resolve guest and room references
  body.guest = await findOrCreateGuest(body);
  body.room  = await resolveRoom(body);
  const booking = await Booking.create(body);
  // Auto-generate QR code
  try {
    const QRCode = require('qrcode');
    const qrData = JSON.stringify({ bookingId: booking.bookingId, hotel: String(booking.hotel), checkIn: booking.checkIn });
    booking.checkInProcess.qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
    booking.checkInProcess.qrGeneratedAt = new Date();
    await booking.save();
  } catch { /* QR generation failed silently — not critical */ }
  const populated = await populateBooking(Booking.findById(booking._id));
  res.status(201).json({ success: true, data: populated });
});
const updateBooking = catchAsync(async (req, res) => {
  const body = { ...req.body };
  if (body.amount && !body.totalAmount) body.totalAmount = body.amount;
  delete body.amount; delete body.id;
  const booking = await Booking.findOneAndUpdate(oneFilter(req), body, { new: true, runValidators: true });
  if (!booking) throw new AppError('Booking not found', 404);
  const populated = await populateBooking(Booking.findById(booking._id));
  sendSuccess(res, populated);
});
const checkIn = catchAsync(async (req, res) => {
  const filter = oneFilter(req);
  filter.status = { $in: ['confirmed', 'pending'] };
  const booking = await Booking.findOne(filter);
  if (!booking) throw new AppError('Booking not found or already checked in', 404);
  booking.status = 'checked_in';
  booking.checkedInAt = new Date();
  await booking.save();
  // Update room status
  await Room.findByIdAndUpdate(booking.room, { status: 'occupied' });
  const populated = await populateBooking(Booking.findById(booking._id));
  sendSuccess(res, populated);
});
const checkOut = catchAsync(async (req, res) => {
  const filter = oneFilter(req);
  filter.status = 'checked_in';
  const booking = await Booking.findOne(filter);
  if (!booking) throw new AppError('Booking not found or not checked in', 404);
  booking.status = 'checked_out';
  booking.checkedOutAt = new Date();
  await booking.save();
  // Update room status
  await Room.findByIdAndUpdate(booking.room, { status: 'available' });
  const populated = await populateBooking(Booking.findById(booking._id));
  sendSuccess(res, populated);
});
const cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancelReason = req.body.reason || '';
  await booking.save();
  await Room.findByIdAndUpdate(booking.room, { status: 'available' });
  sendSuccess(res, booking);
});

// ── Smart Check-In Process ──────────────────────────────────────
const getCheckInProcess = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req)).populate('room', 'roomNumber type');
  if (!booking) throw new AppError('Booking not found', 404);
  sendSuccess(res, {
    bookingId: booking.bookingId,
    status: booking.status,
    room: booking.room,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guest: booking.guest,
    checkInProcess: booking.checkInProcess,
  });
});

const generateQRCode = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  const QRCode = require('qrcode');
  const qrData = JSON.stringify({ bookingId: booking.bookingId, hotel: String(booking.hotel), checkIn: booking.checkIn });
  booking.checkInProcess.qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
  booking.checkInProcess.qrGeneratedAt = new Date();
  await booking.save();
  sendSuccess(res, { qrCode: booking.checkInProcess.qrCode });
});

const updateGuestDetails = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  const { name, phone, email, address } = req.body;
  booking.checkInProcess.guestDetails = { name, phone, email, address, updatedAt: new Date() };
  booking.checkInProcess.stepsCompleted.detailsFilled = true;
  await booking.save();
  sendSuccess(res, { guestDetails: booking.checkInProcess.guestDetails });
});

const uploadIdScan = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  const { idType, idNumber, documentImage } = req.body;
  booking.checkInProcess.idScan = { idType, idNumber, documentImage, verified: true, scannedAt: new Date() };
  booking.checkInProcess.stepsCompleted.idScanned = true;
  await booking.save();
  sendSuccess(res, { idScan: booking.checkInProcess.idScan });
});

const submitFaceVerification = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  const { imageData } = req.body;
  booking.checkInProcess.faceVerification = { status: 'verified', imageData, verifiedAt: new Date() };
  booking.checkInProcess.stepsCompleted.faceVerified = true;
  await booking.save();
  sendSuccess(res, { faceVerification: booking.checkInProcess.faceVerification });
});

const saveSignature = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  const { signature } = req.body;
  booking.checkInProcess.digitalSignature = { signature, signedAt: new Date() };
  booking.checkInProcess.stepsCompleted.signatureDone = true;
  await booking.save();
  sendSuccess(res, { digitalSignature: booking.checkInProcess.digitalSignature });
});

// ── Cab Bookings / Travel Desk ─────────────────────────────────
const getCabBookings = catchAsync(async (req, res) => {
  const { status, type, date } = req.query;
  const filter = hotelFilter(req);
  if (status && status !== 'all') filter.status = status;
  if (type) filter.type = type;
  if (date) {
    const d = new Date(date);
    const next = new Date(d.getTime() + 86400000);
    filter.date = { $gte: d, $lt: next };
  }
  const bookings = await CabBooking.find(filter).sort('-createdAt');
  sendSuccess(res, bookings);
});

const getCabBooking = catchAsync(async (req, res) => {
  const booking = await CabBooking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Cab booking not found', 404);
  sendSuccess(res, booking);
});

const createCabBooking = catchAsync(async (req, res) => {
  const body = { ...req.body, hotel: req.hotelId || req.body.hotel };
  const booking = await CabBooking.create(body);
  res.status(201).json({ success: true, data: booking });
});

const updateCabBooking = catchAsync(async (req, res) => {
  const booking = await CabBooking.findOneAndUpdate(oneFilter(req), req.body, { new: true, runValidators: true });
  if (!booking) throw new AppError('Cab booking not found', 404);
  sendSuccess(res, booking);
});

const deleteCabBooking = catchAsync(async (req, res) => {
  const booking = await CabBooking.findOneAndDelete(oneFilter(req));
  if (!booking) throw new AppError('Cab booking not found', 404);
  sendSuccess(res, booking);
});

// ── Travel Packages ────────────────────────────────────────────
const getTravelPackages = catchAsync(async (req, res) => {
  const filter = hotelFilter(req);
  filter.active = true;
  const packages = await TravelPackage.find(filter).sort('name');
  sendSuccess(res, packages);
});

// ── Guests ─────────────────────────────────────────────────────
const getGuests = catchAsync(async (req, res) => {
  const guests = await Guest.find(hotelFilter(req)).sort('-createdAt');
  sendSuccess(res, guests);
});
const getGuest = catchAsync(async (req, res) => {
  const guest = await Guest.findOne(oneFilter(req));
  if (!guest) throw new AppError('Guest not found', 404);
  sendSuccess(res, guest);
});
const createGuest = catchAsync(async (req, res) => {
  const body = { ...req.body, hotel: req.hotelId || req.body.hotel };
  const guest = await Guest.create(body);
  res.status(201).json({ success: true, data: guest });
});
const updateGuest = catchAsync(async (req, res) => {
  const guest = await Guest.findOneAndUpdate(oneFilter(req), req.body, { new: true, runValidators: true });
  if (!guest) throw new AppError('Guest not found', 404);
  sendSuccess(res, guest);
});

// ── Employees ──────────────────────────────────────────────────
const getEmployees = catchAsync(async (req, res) => {
  const employees = await Employee.find(hotelFilter(req)).sort('-createdAt');
  res.json({ success: true, data: employees });
});
const getEmployee = catchAsync(async (req, res) => {
  const employee = await Employee.findOne(oneFilter(req));
  if (!employee) throw new AppError('Employee not found', 404);
  res.json({ success: true, data: employee });
});
const createEmployee = catchAsync(async (req, res) => {
  const body = { ...req.body, hotel: req.hotelId || req.body.hotel };
  const employee = await Employee.create(body);
  res.status(201).json({ success: true, data: employee });
});
const updateEmployee = catchAsync(async (req, res) => {
  const employee = await Employee.findOneAndUpdate(oneFilter(req), req.body, { new: true, runValidators: true });
  if (!employee) throw new AppError('Employee not found', 404);
  res.json({ success: true, data: employee });
});
const markAttendance = catchAsync(async (req, res) => {
  const { date, status: attStatus, checkIn: timeIn, checkOut: timeOut, hours } = req.body;
  const employee = await Employee.findOne(oneFilter(req));
  if (!employee) throw new AppError('Employee not found', 404);
  if (!employee.attendance) employee.attendance = [];
  const existing = employee.attendance.find(a => a.date && date && new Date(a.date).toDateString() === new Date(date).toDateString());
  if (existing) {
    Object.assign(existing, { status: attStatus || existing.status, checkIn: timeIn || existing.checkIn, checkOut: timeOut || existing.checkOut, hours: hours || existing.hours });
  } else {
    employee.attendance.push({ date, status: attStatus, checkIn: timeIn, checkOut: timeOut, hours });
  }
  await employee.save();
  res.json({ success: true, data: employee });
});
const applyLeave = catchAsync(async (req, res) => {
  const employee = await Employee.findOne(oneFilter(req));
  if (!employee) throw new AppError('Employee not found', 404);
  const { startDate, endDate, type, reason } = req.body;
  if (!employee.leaves) employee.leaves = [];
  employee.leaves.push({ startDate, endDate, type, reason, status: 'pending' });
  await employee.save();
  res.json({ success: true, data: employee });
});

module.exports = {
  getRooms, getRoom, createRoom, updateRoom, deleteRoom,
  updateRoomHousekeeping, checkAvailability,
  getBookings, getBooking, createBooking, updateBooking,
  checkIn, checkOut, cancelBooking,
  getCheckInProcess, generateQRCode, updateGuestDetails,
  uploadIdScan, submitFaceVerification, saveSignature,
  getCabBookings, getCabBooking, createCabBooking, updateCabBooking, deleteCabBooking,
  getTravelPackages,
  getGuests, getGuest, createGuest, updateGuest,
  getEmployees, getEmployee, createEmployee, updateEmployee,
  markAttendance, applyLeave
};
