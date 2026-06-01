const router = require('express').Router();
const {
  getItems,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/manualItemController');
const { protect, scopeToHotel, authorize } = require('../middleware/auth');

// Apply auth and scoping middleware
router.use(protect, scopeToHotel);

// Allow access for 'hotel_admin' (manager) and 'platform_admin'
const requireAdminOrManager = authorize('hotel_admin', 'platform_admin');

router.get('/', getItems);
router.post('/', requireAdminOrManager, createItem);
router.put('/:id', requireAdminOrManager, updateItem);
router.delete('/:id', requireAdminOrManager, deleteItem);

module.exports = router;
