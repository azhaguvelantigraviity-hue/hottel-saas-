// src/controllers/hotelController.js
const { Employee, Attendance } = require('../models/Operations');
const User    = require('../models/User');
const Room    = require('../models/Room');
const Booking = require('../models/Booking');
const Guest   = require('../models/Guest');
const CabBooking = require('../models/CabBooking');
const TravelPackage = require('../models/TravelPackage');
const Hotel = require('../models/Hotel');
const Document = require('../models/Document');
const SubscriptionPayment = require('../models/SubscriptionPayment');
const Payroll = require('../models/Payroll');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { asyncHandler, sendSuccess, AppError } = require('../utils/helpers');
const catchAsync = asyncHandler;
const { emitNotification } = require('../utils/notificationHelper');

// ── Helpers ────────────────────────────────────────────────────
const hotelFilter = (req) => req.hotelId ? { hotel: req.hotelId } : {};
const oneFilter   = (req)  => req.hotelId ? { hotel: req.hotelId, _id: req.params.id } : { _id: req.params.id };
const findOrCreateGuest = async (body) => {
  if (!body.guest && !body.guestName) return null;
  // guest is already an ObjectId
  if (typeof body.guest === 'string' && /^[0-9a-fA-F]{24}$/.test(body.guest)) return body.guest;
  const name = (body.guestName || body.guest || '').trim();
  const parts = name.split(/\s+/);
  const firstName = parts[0] || 'Unknown';
  let lastName  = parts.slice(1).join(' ').trim();
  if (!lastName) lastName = 'Guest'; // Provide default to pass validation

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
  let room = await Room.findOne({ hotel: body.hotel, roomNumber: num });
  if (!room) {
    room = await Room.create({
      hotel: body.hotel,
      roomNumber: num,
      type: 'Standard Twin',
      baseRate: body.roomRate || 0,
      status: 'available'
    });
  }
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
  const body = {
    ...req.body,
    hotel: req.hotelId || req.body.hotel,
    baseRate: req.body.baseRate ?? 0,
  };
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
  let room = await Room.findOne(oneFilter(req));
  if (!room) throw new AppError('Room not found', 404);

  room.housekeepingStatus = req.body.housekeepingStatus;
  if (req.body.housekeepingStatus === 'clean' && room.status === 'cleaning') {
    room.status = 'available';
  }
  await room.save();

  if (req.app.get('io')) {
    req.app.get('io').to(room.hotel.toString()).emit('roomStatusUpdated', {
      roomId: room._id,
      status: room.status,
      housekeepingStatus: room.housekeepingStatus
    });
  }

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
  const idParam = req.params.id;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idParam);
  if (isObjectId) {
    filter.$or = [{ _id: idParam }, { bookingId: idParam }];
  } else {
    filter.bookingId = idParam;
  }
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
  
  // Prevent double booking
  if (body.checkIn && body.checkOut && body.room) {
    const overlap = await Booking.findOne({
      room: body.room,
      status: { $in: ['confirmed', 'checked_in'] },
      $or: [
        { checkIn:  { $lt: new Date(body.checkOut), $gte: new Date(body.checkIn) } },
        { checkOut: { $gt: new Date(body.checkIn),  $lte: new Date(body.checkOut) } },
        { checkIn:  { $lte: new Date(body.checkIn) }, checkOut: { $gte: new Date(body.checkOut) } },
      ]
    });
    if (overlap) {
      throw new AppError('Room is already booked for these dates.', 400);
    }
  }

  // Calculate missing fields required by Booking schema
  if (body.stayDays) {
    body.nights = body.stayDays;
  } else if (!body.nights && body.checkIn && body.checkOut) {
    body.nights = Math.max(1, Math.ceil((new Date(body.checkOut) - new Date(body.checkIn)) / 86400000));
  }
  if (!body.roomRate) {
    const roomDoc = await Room.findById(body.room);
    body.roomRate = roomDoc ? roomDoc.baseRate : 0;
  }

  const booking = await Booking.create(body);
  
  // Update room status
  const room = await Room.findByIdAndUpdate(booking.room, { status: 'occupied' }, { new: true });
  if (room && req.app.get('io')) {
    req.app.get('io').to(booking.hotel.toString()).emit('roomStatusUpdated', {
      roomId: room._id,
      status: room.status,
      housekeepingStatus: room.housekeepingStatus
    });
  }

  // Auto-generate QR code
  try {
    const QRCode = require('qrcode');
    const qrData = JSON.stringify({ bookingId: booking.bookingId, hotel: String(booking.hotel), checkIn: booking.checkIn });
    booking.checkInProcess = booking.checkInProcess || {};
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

  // Manual check-in from dashboard bypasses strict ID scan enforcement
  // if (!booking.checkInProcess?.idScan?.documentImage) {
  //   throw new AppError('Document upload required before check-in', 400);
  // }

  booking.status = 'checked_in';
  booking.checkedInAt = new Date();
  booking.loginTime = new Date();
  await booking.save();

  // Update room status
  const room = await Room.findByIdAndUpdate(booking.room, { status: 'occupied' }, { new: true });
  if (room && req.app.get('io')) {
    req.app.get('io').to(booking.hotel.toString()).emit('roomStatusUpdated', {
      roomId: room._id,
      status: room.status,
      housekeepingStatus: room.housekeepingStatus
    });
  }
  const populated = await populateBooking(Booking.findById(booking._id));

  // Emit Notification
  if (populated && populated.room) {
    await emitNotification(req, {
      hotel: booking.hotel,
      title: 'Room Check-in',
      desc: `Guest checked into Room ${populated.room.roomNumber}`,
      type: 'booking',
      icon: 'check',
      color: 'var(--green)',
      targetRoles: ['admin', 'manager', 'staff'],
      relatedRoom: populated.room.roomNumber
    });
  }

  sendSuccess(res, populated);
});
const checkOut = catchAsync(async (req, res) => {
  const filter = oneFilter(req);
  filter.status = 'checked_in';
  const booking = await Booking.findOne(filter);
  
  if (!booking) throw new AppError('Booking not found or not checked in', 404);

  const { paymentAmount, paymentMethod } = req.body;
  if (paymentAmount) {
    booking.paidAmount = (booking.paidAmount || 0) + Number(paymentAmount);
    if (paymentMethod) booking.paymentMethod = paymentMethod;
  }

  const total = booking.totalAmount || 0;
  const food = booking.foodCharges || 0;
  const laundry = booking.laundryCharges || 0;
  const other = booking.otherCharges || 0;
  const paid = booking.paidAmount || 0;
  
  const grandTotal = total + food + laundry + other;

  if (paid >= grandTotal) {
    booking.paymentStatus = 'paid';
  } else if (paid > 0) {
    booking.paymentStatus = 'partial';
  }

  if (paid < grandTotal) {
    if (paymentAmount) await booking.save(); // Save the partial payment
    throw new AppError(`Pending balance: ₹${(grandTotal - paid).toLocaleString()}. Please collect payment before checking out.`, 400);
  }

  booking.status = 'checked_out';
  booking.checkedOutAt = new Date();
  booking.logoutTime = new Date();
  await booking.save();
  // Update room status
  const room = await Room.findByIdAndUpdate(booking.room, { status: 'cleaning', housekeepingStatus: 'dirty' }, { new: true });
  
  if (room) {
    if (req.app.get('io')) {
      req.app.get('io').to(booking.hotel.toString()).emit('roomStatusUpdated', {
        roomId: room._id,
        status: room.status,
        housekeepingStatus: room.housekeepingStatus
      });
    }
    const { Housekeeping } = require('../models/Operations');
    await Housekeeping.create({
      hotel: booking.hotel,
      roomNumber: room.roomNumber,
      type: 'Full Clean',
      assignedTo: 'Unassigned',
      priority: 'high',
      status: 'pending',
      notes: 'Auto-generated upon guest checkout.'
    });

    await emitNotification(req, {
      hotel: booking.hotel,
      title: 'Cleaning Required',
      desc: `Housekeeping required for Room ${room.roomNumber} after checkout.`,
      type: 'maintenance',
      icon: 'maintenance',
      color: 'var(--rose)',
      targetRoles: ['admin', 'manager'],
      relatedRoom: room.roomNumber
    });
  }

  const populated = await populateBooking(Booking.findById(booking._id));

  if (populated && populated.room) {
    await emitNotification(req, {
      hotel: booking.hotel,
      title: 'Room Checkout',
      desc: `Guest checked out of Room ${populated.room.roomNumber}`,
      type: 'booking',
      icon: 'x',
      color: 'var(--teal)',
      targetRoles: ['admin', 'manager', 'staff'],
      relatedRoom: populated.room.roomNumber
    });
  }

  sendSuccess(res, populated);
});
const cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancelReason = req.body.reason || '';
  await booking.save();
  const room = await Room.findByIdAndUpdate(booking.room, { status: 'available' }, { new: true });
  if (room && req.app.get('io')) {
    req.app.get('io').to(booking.hotel.toString()).emit('roomStatusUpdated', {
      roomId: room._id,
      status: room.status,
      housekeepingStatus: room.housekeepingStatus
    });
  }
  sendSuccess(res, booking);
});

const deleteBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  
  if (booking.room && (booking.status === 'checked-in' || booking.status === 'confirmed')) {
    const room = await Room.findByIdAndUpdate(booking.room, { status: 'available' }, { new: true });
    if (room && req.app.get('io')) {
      req.app.get('io').to(booking.hotel.toString()).emit('roomStatusUpdated', {
        roomId: room._id,
        status: room.status,
        housekeepingStatus: room.housekeepingStatus
      });
    }
  }
  
  await booking.deleteOne();
  sendSuccess(res, null, 204);
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
  
  const { idType, idNumber } = req.body;
  let documentImage = req.body.documentImage;
  
  if (req.file) {
    documentImage = `/uploads/documents/${req.file.filename}`;
  }
  
  if (!documentImage) {
    throw new AppError('No document image provided', 400);
  }

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
  // Log query parameters and hotel context for debugging 400 errors
  console.log('GET /hotel/guests called with query:', req.query, 'hotelId:', req.hotelId);
  const filter = hotelFilter(req);
  // If hotelId is undefined, allow fetching all guests (admin) but ensure no empty filter leads to unexpected errors
  const guests = await Guest.find(filter).sort('-createdAt');
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
const deleteGuest = catchAsync(async (req, res) => {
  const guest = await Guest.findOneAndDelete(oneFilter(req));
  if (!guest) throw new AppError('Guest not found', 404);
  sendSuccess(res, guest);
});

// ── Employees ──────────────────────────────────────────────────
const getEmployees = catchAsync(async (req, res) => {
  const filter = hotelFilter(req);
  if (req.query.department) {
    const deptRegex = new RegExp(req.query.department, 'i');
    filter.$or = [
      { department: deptRegex },
      { role: deptRegex }
    ];
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  const employees = await Employee.find(filter).sort('-createdAt');
  res.json({ success: true, data: employees });
});
const getEmployee = catchAsync(async (req, res) => {
  const employee = await Employee.findOne(oneFilter(req));
  if (!employee) throw new AppError('Employee not found', 404);
  res.json({ success: true, data: employee });
});
const createEmployee = catchAsync(async (req, res) => {
  const body = { ...req.body, hotel: req.hotelId || req.body.hotel };

  if (req.user && ['hotel_staff', 'receptionist'].includes(req.user.role)) {
    const allowedDepts = ['Housekeeping', 'Security', 'Cleaning'];
    if (!allowedDepts.includes(body.department)) {
      throw new AppError(`Receptionists can only add employees to ${allowedDepts.join(', ')} departments`, 403);
    }
    const rStr = (body.role || '').toLowerCase();
    if (rStr.includes('manager') || rStr.includes('admin') || rStr.includes('reception') || rStr.includes('front')) {
      throw new AppError('Receptionists are not allowed to create Manager/Admin/Reception roles', 403);
    }
  }

  const employee = await Employee.create(body);

  if (req.body.loginEmail && req.body.loginPassword) {
    const isReceptionist = body.department === 'Front Office' || (body.role || '').toLowerCase().includes('reception');
    const isHousekeeping = body.department === 'Housekeeping';
    
    let assignRole = 'hotel_staff';
    if (isReceptionist) assignRole = 'receptionist';
    else if (isHousekeeping) assignRole = 'housekeeping';

    const existingUser = await User.findOne({ email: req.body.loginEmail });
    if (!existingUser) {
      await User.create({
        name: body.name,
        email: req.body.loginEmail,
        password: req.body.loginPassword,
        role: assignRole,
        hotel: body.hotel,
        department: body.department === 'Front Office' ? 'Front Desk' : body.department,
        isActive: true
      });
    }
  }

  res.status(201).json({ success: true, data: employee });
});
const updateEmployee = catchAsync(async (req, res) => {
  const employee = await Employee.findOneAndUpdate(oneFilter(req), req.body, { new: true, runValidators: true });
  if (!employee) throw new AppError('Employee not found', 404);
  res.json({ success: true, data: employee });
});
const deleteEmployee = catchAsync(async (req, res) => {
  const employee = await Employee.findOneAndDelete(oneFilter(req));
  if (!employee) throw new AppError('Employee not found', 404);
  res.json({ success: true, data: employee });
});
const markAttendance = catchAsync(async (req, res) => {
  const { date, status: attStatus, checkIn: timeIn, checkOut: timeOut, hours } = req.body;
  const employeeId = req.params.id; // From route parameter
  
  const employee = await Employee.findOne({ _id: employeeId, hotel: req.hotelId });
  if (!employee) throw new AppError('Employee not found', 404);

  // Ensure date is UTC midnight to avoid timezone shifts
  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  const attendanceRecord = await Attendance.findOneAndUpdate(
    { hotel: req.hotelId, employee: employeeId, date: parsedDate },
    {
      $set: {
        status: attStatus,
        checkIn: timeIn,
        checkOut: timeOut,
        hours: hours
      }
    },
    { new: true, upsert: true }
  );

  res.json({ success: true, data: attendanceRecord });
});

const getAttendance = catchAsync(async (req, res) => {
  const records = await Attendance.find({ hotel: req.hotelId }).populate('employee', 'name avatar');
  res.json({ success: true, data: records });
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

// ── Dashboard Features ─────────────────────────────────────────
const getTodayCheckins = catchAsync(async (req, res) => {
  const start = new Date(new Date().setHours(0,0,0,0));
  const end = new Date(new Date().setHours(23,59,59,999));
  const filter = { ...hotelFilter(req), checkIn: { $gte: start, $lte: end } };
  const checkins = await populateBooking(Booking.find(filter).sort('checkIn'));
  sendSuccess(res, checkins);
});

const getTodayCheckouts = catchAsync(async (req, res) => {
  const start = new Date(new Date().setHours(0,0,0,0));
  const end = new Date(new Date().setHours(23,59,59,999));
  const filter = { ...hotelFilter(req), checkOut: { $gte: start, $lte: end } };
  const checkouts = await populateBooking(Booking.find(filter).sort('checkOut'));
  sendSuccess(res, checkouts);
});

const getPendingPayments = catchAsync(async (req, res) => {
  const filter = { ...hotelFilter(req), paymentStatus: { $in: ['pending', 'overdue'] } };
  const pending = await populateBooking(Booking.find(filter).sort('checkIn'));
  sendSuccess(res, pending);
});

const getMaintenanceRooms = catchAsync(async (req, res) => {
  const filter = { ...hotelFilter(req), status: 'maintenance' };
  const rooms = await Room.find(filter).sort('roomNumber');
  sendSuccess(res, rooms);
});

const updateRoomMaintenance = catchAsync(async (req, res) => {
  const updates = req.body;
  const room = await Room.findOneAndUpdate(oneFilter(req), updates, { new: true });
  if (!room) throw new AppError('Room not found', 404);
  sendSuccess(res, room);
});

// ── Subscriptions / Razorpay ───────────────────────────────────
const createSubscriptionOrder = catchAsync(async (req, res) => {
  const { plan } = req.body;
  const hotelId = req.hotelId;
  
  if (!hotelId) throw new AppError('Hotel not found', 404);
  
  let amount = 0;
  if (plan === 'starter') amount = 49;
  else if (plan === 'professional') amount = 12999;
  else if (plan === 'enterprise') amount = 24999;
  else throw new AppError('Invalid plan selected', 400);

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });

  const options = {
    amount: amount * 100, // amount in smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_sub_${hotelId}_${Date.now()}`
  };

  const order = await razorpay.orders.create(options);

  if (!order) {
    throw new AppError('Some error occurred while creating Razorpay order', 500);
  }

  // Save pending payment to DB
  await SubscriptionPayment.create({
    hotelId,
    plan,
    amount,
    currency: 'INR',
    razorpayOrderId: order.id,
    status: 'pending'
  });

  res.status(200).json({ success: true, data: order });
});

const verifySubscriptionPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  const hotelId = req.hotelId;

  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

  // Verify signature
  const hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature !== razorpay_signature) {
    // Payment failed verification
    await SubscriptionPayment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
    );
    throw new AppError('Payment verification failed', 400);
  }

  // Payment successful
  await SubscriptionPayment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { status: 'success', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
  );

  // Update Hotel
  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(nextPaymentDate.getDate() + 30); // 30 days from now

  const updatedHotel = await Hotel.findByIdAndUpdate(
    hotelId,
    {
      plan,
      planStatus: 'active',
      subscriptionStart: new Date(),
      nextPaymentAt: nextPaymentDate
    },
    { new: true }
  );

  res.status(200).json({ success: true, data: updatedHotel });
});

const updateProfile = catchAsync(async (req, res) => {
  const allowedUpdates = ['name', 'address', 'phone', 'email', 'website'];
  const updateData = {};
  for (let key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updateData[key] = req.body[key];
    }
  }
  const hotel = await Hotel.findByIdAndUpdate(req.hotelId, updateData, { new: true });
  sendSuccess(res, hotel);
});

// ── Payroll ───────────────────────────────────────────────────
const getPayrollRecords = catchAsync(async (req, res) => {
  const { month } = req.query; // format 'YYYY-MM'
  if (!month) throw new AppError('Month is required', 400);

  const employees = await Employee.find(hotelFilter(req));
  
  let payrollRecords = await Payroll.find({ hotel: req.hotelId, month }).populate('employee');

  const yearStr = month.split('-')[0];
  const monthStr = month.split('-')[1];
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  // Initialize missing records
  for (const emp of employees) {
    let pr = payrollRecords.find(p => p.employee && p.employee._id.toString() === emp._id.toString());
    if (!pr) {
      // Calculate paid days from attendance
      const startDate = new Date(year, monthIdx, 1);
      const endDate = new Date(year, monthIdx + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      const attendances = await Attendance.find({
        hotel: req.hotelId,
        employee: emp._id,
        date: { $gte: startDate, $lte: endDate }
      });

      const present = attendances.filter(a => a.status === 'present').length;
      const late = attendances.filter(a => a.status === 'late').length;
      const leave = attendances.filter(a => a.status === 'leave').length;
      
      const paidDays = present + late + leave;
      const baseSalary = emp.salary || 0;
      
      let netSalary = 0;
      if (daysInMonth > 0) {
        netSalary = Math.round((baseSalary / daysInMonth) * paidDays);
      }

      pr = await Payroll.create({
        hotel: req.hotelId,
        employee: emp._id,
        month,
        baseSalary,
        workingDays: daysInMonth,
        paidDays,
        netSalary
      });
      pr.employee = emp; // Attach populated employee
      payrollRecords.push(pr);
    }
  }

  sendSuccess(res, payrollRecords);
});

const updatePayrollRecord = catchAsync(async (req, res) => {
  const { overtime = 0, bonus = 0, deductions = 0, advance = 0, workingDays, paidDays } = req.body;
  const pr = await Payroll.findOne(oneFilter(req));
  if (!pr) throw new AppError('Payroll record not found', 404);

  if (workingDays !== undefined) pr.workingDays = workingDays;
  if (paidDays !== undefined) pr.paidDays = paidDays;
  
  pr.overtime = overtime;
  pr.bonus = bonus;
  pr.deductions = deductions;
  pr.advance = advance;

  // Recalculate net salary
  const baseFraction = pr.workingDays > 0 ? (pr.baseSalary / pr.workingDays) * pr.paidDays : 0;
  pr.netSalary = Math.round(baseFraction + pr.overtime + pr.bonus - pr.deductions - pr.advance);

  await pr.save();
  await pr.populate('employee');

  sendSuccess(res, pr);
});

const markPayrollPaid = catchAsync(async (req, res) => {
  const pr = await Payroll.findOne(oneFilter(req)).populate('employee');
  if (!pr) throw new AppError('Payroll record not found', 404);

  pr.status = 'Paid';
  pr.paidDate = new Date();

  // Snapshot payslip data
  pr.payslipData = {
    employeeName: pr.employee.name,
    role: pr.employee.role,
    month: pr.month,
    baseSalary: pr.baseSalary,
    workingDays: pr.workingDays,
    paidDays: pr.paidDays,
    overtime: pr.overtime,
    bonus: pr.bonus,
    deductions: pr.deductions,
    advance: pr.advance,
    netSalary: pr.netSalary,
    paidDate: pr.paidDate
  };

  await pr.save();
  sendSuccess(res, pr);
});

const processAllPendingPayroll = catchAsync(async (req, res) => {
  const { month } = req.body;
  if (!month) throw new AppError('Month is required', 400);

  const pendingRecords = await Payroll.find({ hotel: req.hotelId, month, status: 'Pending', netSalary: { $gt: 0 } }).populate('employee');

  for (const pr of pendingRecords) {
    pr.status = 'Paid';
    pr.paidDate = new Date();
    pr.payslipData = {
      employeeName: pr.employee.name,
      role: pr.employee.role,
      month: pr.month,
      baseSalary: pr.baseSalary,
      workingDays: pr.workingDays,
      paidDays: pr.paidDays,
      overtime: pr.overtime,
      bonus: pr.bonus,
      deductions: pr.deductions,
      advance: pr.advance,
      netSalary: pr.netSalary,
      paidDate: pr.paidDate
    };
    await pr.save();
  }

  sendSuccess(res, { message: `${pendingRecords.length} records processed.` });
});

// ── Documents ────────────────────────────────────────────────────────
const uploadDocument = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  
  if (!req.file) throw new AppError('No document file provided', 400);

  const doc = await Document.create({
    hotel: req.hotelId,
    bookingId: booking.bookingId,
    guestId: booking.guest,
    docType: req.body.docType || 'Aadhaar',
    fileUrl: `/uploads/documents/${req.file.filename}`,
    fileName: req.file.originalname,
    uploadedBy: req.user.id
  });

  sendSuccess(res, doc, 201);
});

const getDocuments = catchAsync(async (req, res) => {
  const booking = await Booking.findOne(oneFilter(req));
  if (!booking) throw new AppError('Booking not found', 404);
  const docs = await Document.find({ hotel: req.hotelId, bookingId: booking.bookingId });
  sendSuccess(res, docs);
});

const getGuestDocuments = catchAsync(async (req, res) => {
  const docs = await Document.find({ hotel: req.hotelId, guestId: req.params.id });
  sendSuccess(res, docs);
});

const deleteDocument = catchAsync(async (req, res) => {
  const doc = await Document.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!doc) throw new AppError('Document not found', 404);
  sendSuccess(res, null, 204);
});

const requestAdminHelp = catchAsync(async (req, res) => {
  if (!req.user.hotel) throw new AppError('No hotel associated', 400);
  
  const msg = req.body.message || `Manager ${req.user.name} requires admin control/support.`;

  await emitNotification(req, {
    hotel: req.user.hotel,
    title: 'Manager Help Required',
    desc: msg,
    type: 'help_request',
    icon: 'alert-triangle',
    color: 'var(--rose)',
    targetRoles: ['platform_admin']
  });

  sendSuccess(res, { message: 'Admin support requested successfully' });
});

module.exports = {
  getRooms, getRoom, createRoom, updateRoom, deleteRoom,
  updateRoomHousekeeping, checkAvailability,
  getBookings, getBooking, createBooking, updateBooking,
  checkIn, checkOut, cancelBooking, deleteBooking,
  getCheckInProcess, generateQRCode, updateGuestDetails,
  uploadIdScan, submitFaceVerification, saveSignature,
  getCabBookings, getCabBooking, createCabBooking, updateCabBooking, deleteCabBooking,
  getTravelPackages,
  getGuests, getGuest, createGuest, updateGuest, deleteGuest,
  getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,
  markAttendance, applyLeave, getAttendance,
  getTodayCheckins, getTodayCheckouts, getPendingPayments, getMaintenanceRooms, updateRoomMaintenance,
  createSubscriptionOrder, verifySubscriptionPayment, updateProfile,
  getPayrollRecords, updatePayrollRecord, markPayrollPaid, processAllPendingPayroll,
  uploadDocument, getDocuments, getGuestDocuments, deleteDocument, requestAdminHelp
};
