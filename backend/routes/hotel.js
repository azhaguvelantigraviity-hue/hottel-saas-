// src/routes/hotel.js
const router = require('express').Router();
const upload = require('../utils/upload');
const {
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
  markAttendance, applyLeave,
  getTodayCheckins, getTodayCheckouts, getPendingPayments, getMaintenanceRooms, updateRoomMaintenance,
  createSubscriptionOrder, verifySubscriptionPayment, getAttendance, updateProfile,
  getPayrollRecords, updatePayrollRecord, markPayrollPaid, processAllPendingPayroll,
  uploadDocument, getDocuments, getGuestDocuments, deleteDocument,
  getHotelDashboard, extendStay, changeRoom, searchGuestById, processAadhaarOcr
} = require('../controllers/hotelController');
const { getRecommendations, getAllocationAnalytics } = require('../controllers/allocationController');
const { protect, authorize, scopeToHotel, hotelAdmin } = require('../middleware/auth');
const { requireFeature, enforceLimit } = require('../middleware/planGate');
const Room     = require('../models/Room');
const { Employee } = require('../models/Operations');

router.use(protect, scopeToHotel);

// ── Property Profile ────────────────────────────────────────────────────────
router.put   ('/profile',                 hotelAdmin, upload.single('logoFile'), updateProfile);

// ── Rooms (all plans) ─────────────────────────────────────────────────────────
router.get   ('/rooms/availability',              checkAvailability);
router.get   ('/rooms/maintenance',               getMaintenanceRooms);
router.get   ('/rooms',                           getRooms);
router.post  ('/rooms',   hotelAdmin, enforceLimit('rooms', Room), createRoom);
router.get   ('/rooms/:id',                       getRoom);
router.put   ('/rooms/:id',             hotelAdmin, updateRoom);
router.delete('/rooms/:id',             hotelAdmin, deleteRoom);
router.patch ('/rooms/:id/housekeeping',            updateRoomHousekeeping);
router.patch ('/rooms/:id/maintenance',             updateRoomMaintenance);

// ── Bookings (all plans) ──────────────────────────────────────────────────────
router.get  ('/bookings/today/checkins',           getTodayCheckins);
router.get  ('/bookings/today/checkouts',          getTodayCheckouts);
router.get  ('/bookings/guest-lookup',             searchGuestById);
router.get  ('/bookings',                          getBookings);
router.post ('/bookings',                          createBooking);
router.get  ('/bookings/:id',                      getBooking);
router.put  ('/bookings/:id',        hotelAdmin,   updateBooking);
router.post ('/bookings/:id/checkin',              checkIn);
router.post ('/bookings/:id/checkout',             checkOut);
router.post ('/bookings/:id/extend',               extendStay);
router.post ('/bookings/:id/change-room',          changeRoom);
router.post ('/bookings/:id/cancel',               cancelBooking);
router.delete('/bookings/:id',                     deleteBooking);

// ── Smart Room Allocation ─────────────────────────────────────────────────────
router.post ('/allocations/recommend',                 getRecommendations);
router.get  ('/allocations/analytics',                 getAllocationAnalytics);

// ── Dashboard / Payments ──────────────────────────────────────────────────────
router.get  ('/dashboard',                         getHotelDashboard);
router.get  ('/payments/pending',                  getPendingPayments);

// ── Smart Check-In Process (all plans) ──────────────────────────────────────
router.get   ('/bookings/:id/checkin-process',       getCheckInProcess);
router.post  ('/bookings/:id/qr-code',               generateQRCode);
router.put   ('/bookings/:id/guest-details',         updateGuestDetails);
router.post  ('/bookings/:id/id-scan',               upload.single('documentImage'), uploadIdScan);
router.post  ('/bookings/:id/face-verification',     submitFaceVerification);
router.post  ('/bookings/:id/signature',             saveSignature);

// ── AI OCR ────────────────────────────────────────────────────────────────────
router.post  ('/ocr/aadhaar',                        upload.single('aadhaarImage'), processAadhaarOcr);

// ── Documents ─────────────────────────────────────────────────────────────────
router.post  ('/bookings/:id/documents',             upload.single('documentFile'), uploadDocument);
router.get   ('/bookings/:id/documents',             getDocuments);
router.get   ('/guests/:id/documents',               getGuestDocuments);
router.delete('/documents/:id',                      deleteDocument);

// ── Cab Bookings / Travel Desk (all plans) ────────────────────────────────────
router.get   ('/cab-bookings',                         getCabBookings);
router.post  ('/cab-bookings',                         createCabBooking);
router.get   ('/cab-bookings/:id',                     getCabBooking);
router.put   ('/cab-bookings/:id',                     updateCabBooking);
router.delete('/cab-bookings/:id',                     deleteCabBooking);
router.get   ('/travel-packages',                      getTravelPackages);

// ── Guests / CRM (Professional+) ─────────────────────────────────────────────
router.use('/guests', requireFeature('guests'));
router.get   ('/guests',         getGuests);
router.post  ('/guests',         createGuest);
router.get   ('/guests/:id',     getGuest);
router.put   ('/guests/:id',     updateGuest);
router.delete('/guests/:id',     deleteGuest);

// ── Attendance — available on all plans ────────────────────────
router.get   ('/attendance',                              getAttendance);
router.post  ('/employees/:id/attendance',                markAttendance);
router.post  ('/employees/:id/leave',                     applyLeave);

// ── Employees (Professional+) ─────────────────────────────────────────────────
router.use('/employees', requireFeature('employees'));
router.get   ('/employees',                               getEmployees);
router.post  ('/employees', authorize('hotel_admin', 'platform_admin', 'manager', 'hotel_staff', 'receptionist', 'housekeeping'), enforceLimit('staffAccounts', Employee), createEmployee);
router.get   ('/employees/:id',                           getEmployee);
router.put   ('/employees/:id', authorize('hotel_admin', 'platform_admin', 'manager', 'hotel_staff', 'receptionist', 'housekeeping'), updateEmployee);
router.delete('/employees/:id', authorize('hotel_admin', 'platform_admin', 'manager', 'hotel_staff', 'receptionist', 'housekeeping'), deleteEmployee);

// ── Payroll (Professional+) ───────────────────────────────────────────────────
router.get   ('/payroll', getPayrollRecords);
router.post  ('/payroll/process-pending', processAllPendingPayroll);
router.put   ('/payroll/:id', updatePayrollRecord);
router.post  ('/payroll/:id/mark-paid', markPayrollPaid);

// ── Subscriptions / Razorpay ──────────────────────────────────────────────────
router.post('/subscription/create-order', createSubscriptionOrder);
router.post('/subscription/verify', verifySubscriptionPayment);

// ── Admin Help Request ────────────────────────────────────────────────────────
const { requestAdminHelp } = require('../controllers/hotelController');
router.post('/request-admin-help', requestAdminHelp);

module.exports = router;
