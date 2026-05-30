// src/routes/hotel.js
const router = require('express').Router();
const {
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
  markAttendance, applyLeave,
} = require('../controllers/hotelController');
const { protect, authorize, scopeToHotel, hotelAdmin } = require('../middleware/auth');
const { requireFeature, enforceLimit } = require('../middleware/planGate');
const Room     = require('../models/Room');
const { Employee } = require('../models/Operations');

router.use(protect, scopeToHotel);

// ── Rooms (all plans) ─────────────────────────────────────────────────────────
router.get   ('/rooms/availability',              checkAvailability);
router.get   ('/rooms',                           getRooms);
router.post  ('/rooms',   hotelAdmin, enforceLimit('rooms', Room), createRoom);
router.get   ('/rooms/:id',                       getRoom);
router.put   ('/rooms/:id',             hotelAdmin, updateRoom);
router.delete('/rooms/:id',             hotelAdmin, deleteRoom);
router.patch ('/rooms/:id/housekeeping',            updateRoomHousekeeping);

// ── Bookings (all plans) ──────────────────────────────────────────────────────
router.get  ('/bookings',                          getBookings);
router.post ('/bookings',                          createBooking);
router.get  ('/bookings/:id',                      getBooking);
router.put  ('/bookings/:id',        hotelAdmin,   updateBooking);
router.post ('/bookings/:id/checkin',              checkIn);
router.post ('/bookings/:id/checkout',             checkOut);
router.post ('/bookings/:id/cancel',               cancelBooking);

// ── Smart Check-In Process (all plans) ──────────────────────────────────────
router.get   ('/bookings/:id/checkin-process',       getCheckInProcess);
router.post  ('/bookings/:id/qr-code',               generateQRCode);
router.put   ('/bookings/:id/guest-details',         updateGuestDetails);
router.post  ('/bookings/:id/id-scan',               uploadIdScan);
router.post  ('/bookings/:id/face-verification',     submitFaceVerification);
router.post  ('/bookings/:id/signature',             saveSignature);

// ── Cab Bookings / Travel Desk (all plans) ────────────────────────────────────
router.get   ('/cab-bookings',                         getCabBookings);
router.post  ('/cab-bookings',                         createCabBooking);
router.get   ('/cab-bookings/:id',                     getCabBooking);
router.put   ('/cab-bookings/:id',                     updateCabBooking);
router.delete('/cab-bookings/:id',                     deleteCabBooking);
router.get   ('/travel-packages',                      getTravelPackages);

// ── Guests / CRM (Professional+) ─────────────────────────────────────────────
router.use('/guests', requireFeature('guestCRM'));
router.get  ('/guests',         getGuests);
router.post ('/guests',         createGuest);
router.get  ('/guests/:id',     getGuest);
router.put  ('/guests/:id',     updateGuest);

// ── Attendance — available on all plans ────────────────────────
router.post  ('/employees/:id/attendance',                markAttendance);
router.post  ('/employees/:id/leave',                     applyLeave);

// ── Employees (Professional+) ─────────────────────────────────────────────────
router.use('/employees', requireFeature('employeeManagement'));
router.get   ('/employees',                               getEmployees);
router.post  ('/employees', hotelAdmin, enforceLimit('staffAccounts', Employee), createEmployee);
router.get   ('/employees/:id',                           getEmployee);
router.put   ('/employees/:id',          hotelAdmin,      updateEmployee);

module.exports = router;
