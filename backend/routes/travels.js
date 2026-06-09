const express = require('express');
const router = express.Router();
const { protect, scopeToHotel, authorize } = require('../middleware/auth');
const {
  requireEnterprise,
  getAgencies, createAgency, updateAgency, deleteAgency,
  addVehicle, updateVehicle, deleteVehicle,
  addDriver, updateDriver, deleteDriver,
  getBookings, createBooking, updateBookingStatus, updateBookingPayment
} = require('../controllers/travelController');

router.use(protect);
router.use(scopeToHotel);
router.use(authorize('platform_admin', 'hotel_admin', 'manager', 'reception'));
router.use(requireEnterprise);

// Agencies
router.route('/agencies')
  .get(getAgencies)
  .post(createAgency);
router.route('/agencies/:id')
  .put(updateAgency)
  .delete(deleteAgency);

// Vehicles
router.route('/agencies/:id/vehicles')
  .post(addVehicle);
router.route('/agencies/:agencyId/vehicles/:vehicleId')
  .put(updateVehicle)
  .delete(deleteVehicle);

// Drivers
router.route('/agencies/:id/drivers')
  .post(addDriver);
router.route('/agencies/:agencyId/drivers/:driverId')
  .put(updateDriver)
  .delete(deleteDriver);

// Bookings
router.route('/bookings')
  .get(getBookings)
  .post(createBooking);
router.route('/bookings/:id/status')
  .put(updateBookingStatus);
router.route('/bookings/:id/payment')
  .put(updateBookingPayment);

module.exports = router;
