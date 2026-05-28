// src/routes/admin.js
const router = require('express').Router();
const {
  getDashboard, getAllHotels, getHotel, createHotel, updateHotel,
  updateSubscription, deleteHotel, getPlatformRevenue, getAuditLogs,
  getAllUsers, getPlatformStats,
} = require('../controllers/adminController');
const { protect, platformAdmin } = require('../middleware/auth');

// All admin routes require platform_admin role
router.use(protect, platformAdmin);

router.get  ('/dashboard',               getDashboard);
router.get  ('/hotels',                  getAllHotels);
router.post ('/hotels',                  createHotel);
router.get  ('/hotels/:id',              getHotel);
router.put  ('/hotels/:id',              updateHotel);
router.put  ('/hotels/:id/subscription', updateSubscription);
router.delete('/hotels/:id',             deleteHotel);
router.get  ('/revenue',                 getPlatformRevenue);
router.get  ('/audit-logs',              getAuditLogs);
router.get  ('/users',                   getAllUsers);
router.get  ('/stats/overview',          getPlatformStats);

module.exports = router;
