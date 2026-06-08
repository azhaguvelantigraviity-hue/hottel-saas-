const router = require('express').Router();
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect, scopeToHotel, authorize } = require('../middleware/auth');

router.use(protect, scopeToHotel);

// All hotel staff can access complaints
router.use(authorize('hotel_admin', 'platform_admin', 'manager', 'hotel_staff', 'receptionist', 'housekeeping'));

router.get('/', getComplaints);
router.post('/', createComplaint);
router.get('/:id', getComplaint);
router.put('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);

module.exports = router;
