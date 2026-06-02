const router = require('express').Router();
const {
  getOrders,
  createOrder,
  updateOrder,
  advanceOrder,
  deleteOrder,
} = require('../controllers/laundryController');
const { protect, scopeToHotel, authorize } = require('../middleware/auth');
const { requireFeature } = require('../middleware/planGate');

router.use(protect, scopeToHotel);

router.get('/', getOrders);
router.post('/', requireFeature('laundry'), authorize('hotel_admin', 'hotel_staff', 'platform_admin'), createOrder);
router.put('/:id', requireFeature('laundry'), authorize('hotel_admin', 'hotel_staff', 'platform_admin'), updateOrder);
router.patch('/:id/advance', requireFeature('laundry'), authorize('hotel_admin', 'hotel_staff', 'platform_admin'), advanceOrder);
router.delete('/:id', requireFeature('laundry'), authorize('hotel_admin', 'platform_admin'), deleteOrder);

module.exports = router;
