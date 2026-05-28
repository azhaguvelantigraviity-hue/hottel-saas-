// src/controllers/hotelController.js
const catchAsync = require('../utils/helpers').catchAsync || ((fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
});

const placeholder = catchAsync(async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

module.exports = {
  getRooms: placeholder,
  getRoom: placeholder,
  createRoom: placeholder,
  updateRoom: placeholder,
  deleteRoom: placeholder,
  updateRoomHousekeeping: placeholder,
  checkAvailability: placeholder,
  getBookings: placeholder,
  getBooking: placeholder,
  createBooking: placeholder,
  updateBooking: placeholder,
  checkIn: placeholder,
  checkOut: placeholder,
  cancelBooking: placeholder,
  getGuests: placeholder,
  getGuest: placeholder,
  createGuest: placeholder,
  updateGuest: placeholder,
  getEmployees: placeholder,
  getEmployee: placeholder,
  createEmployee: placeholder,
  updateEmployee: placeholder,
  markAttendance: placeholder,
  applyLeave: placeholder
};
