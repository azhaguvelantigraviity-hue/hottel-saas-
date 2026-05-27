// src/routes/operations.js
const router = require('express').Router();
const {
  getHousekeepingTasks, createHousekeepingTask, updateHousekeepingTask,
  verifyHousekeepingTask, getHousekeepingDashboard,
  getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest,
  getPOSOrders, createPOSOrder, updatePOSOrder, getPOSSummary,
  getRevenueReport, getOccupancyReport, getBookingSourceReport, getRevenueAIInsights,
  getChannelStatus, syncChannels,
} = require('../controllers/operationsController');
const { protect, scopeToHotel } = require('../middleware/auth');
const { requireFeature } = require('../middleware/planGate');

router.use(protect, scopeToHotel);

// ── Housekeeping (Professional+) ─────────────────────────────────────────────
router.use('/housekeeping', requireFeature('housekeepingModule'));
router.get  ('/housekeeping/dashboard',      getHousekeepingDashboard);
router.get  ('/housekeeping',                getHousekeepingTasks);
router.post ('/housekeeping',                createHousekeepingTask);
router.put  ('/housekeeping/:id',            updateHousekeepingTask);
router.post ('/housekeeping/:id/verify',     verifyHousekeepingTask);

// ── Maintenance (Professional+) ──────────────────────────────────────────────
router.use('/maintenance', requireFeature('maintenanceTracking'));
router.get  ('/maintenance',      getMaintenanceRequests);
router.post ('/maintenance',      createMaintenanceRequest);
router.put  ('/maintenance/:id',  updateMaintenanceRequest);

// ── Restaurant POS (Professional+) ───────────────────────────────────────────
router.use('/pos', requireFeature('restaurantPOS'));
router.get  ('/pos/summary',  getPOSSummary);
router.get  ('/pos',          getPOSOrders);
router.post ('/pos',          createPOSOrder);
router.put  ('/pos/:id',      updatePOSOrder);

// ── Reports ───────────────────────────────────────────────────────────────────
// Basic reports: all plans | Advanced: Professional+ | AI: Enterprise only
router.get('/reports/revenue',    getRevenueReport);
router.get('/reports/occupancy',  getOccupancyReport);
router.get('/reports/sources',    requireFeature('advancedAnalytics'), getBookingSourceReport);
router.get('/reports/ai-insights',requireFeature('revenueManagementAI'), getRevenueAIInsights);

// ── Channel Manager (Professional+) ──────────────────────────────────────────
router.use('/channels', requireFeature('channelManager'));
router.get ('/channels',      getChannelStatus);
router.post('/channels/sync', syncChannels);

module.exports = router;
