// src/routes/operations.js
const router = require('express').Router();
const {
  getHousekeepingTasks, createHousekeepingTask, updateHousekeepingTask,
  verifyHousekeepingTask, getHousekeepingDashboard,
  getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
  getPOSOrders, createPOSOrder, updatePOSOrder, getPOSSummary,
  getHalls, createHall, updateHall, deleteHall,
  getEventBookings, createEventBooking, updateEventBooking, deleteEventBooking,
  getCateringPackages, createCateringPackage, updateCateringPackage, deleteCateringPackage,
  getCameras, createCamera, updateCamera, deleteCamera,
  getVisitors, createVisitor, updateVisitor, deleteVisitor,
  getSecurityActivity, createSecurityActivity,
  getUserSessions, revokeSession,
  getRevenueReport, getOccupancyReport, getBookingSourceReport, getRevenueAIInsights,
  getChannelStatus, syncChannels,
} = require('../controllers/operationsController');
const { protect, scopeToHotel } = require('../middleware/auth');
const { requireFeature } = require('../middleware/planGate');

router.use(protect, scopeToHotel);

// ── Housekeeping (Professional+) ─────────────────────────────────────────────
router.use('/housekeeping', requireFeature('housekeeping'));
router.get  ('/housekeeping/dashboard',      getHousekeepingDashboard);
router.get  ('/housekeeping',                getHousekeepingTasks);
router.post ('/housekeeping',                createHousekeepingTask);
router.put  ('/housekeeping/:id',            updateHousekeepingTask);
router.post ('/housekeeping/:id/verify',     verifyHousekeepingTask);

// ── Maintenance (Professional+) ──────────────────────────────────────────────
router.use('/maintenance', requireFeature('maintenance'));
router.get  ('/maintenance',      getMaintenanceRequests);
router.post ('/maintenance',      createMaintenanceRequest);
router.put  ('/maintenance/:id',  updateMaintenanceRequest);

// ── Restaurant POS (Professional+) ───────────────────────────────────────────
router.use('/pos', requireFeature('restaurant'));
router.get  ('/pos/menu',     getMenuItems);
router.post ('/pos/menu',     createMenuItem);
router.put  ('/pos/menu/:id', updateMenuItem);
router.delete('/pos/menu/:id',deleteMenuItem);
router.get  ('/pos/summary',  getPOSSummary);
router.get  ('/pos',          getPOSOrders);
router.post ('/pos',          createPOSOrder);
router.put  ('/pos/:id',      updatePOSOrder);

// ── Events & Halls (Enterprise) ──────────────────────────────────────────────
router.use('/events/halls', requireFeature('events'));
router.get  ('/events/halls',          getHalls);
router.post ('/events/halls',          createHall);
router.put  ('/events/halls/:id',      updateHall);
router.delete('/events/halls/:id',     deleteHall);

router.use('/events/bookings', requireFeature('events'));
router.get  ('/events/bookings',          getEventBookings);
router.post ('/events/bookings',          createEventBooking);
router.put  ('/events/bookings/:id',      updateEventBooking);
router.delete('/events/bookings/:id',     deleteEventBooking);

router.use('/events/catering', requireFeature('events'));
router.get  ('/events/catering',          getCateringPackages);
router.post ('/events/catering',          createCateringPackage);
router.put  ('/events/catering/:id',      updateCateringPackage);
router.delete('/events/catering/:id',     deleteCateringPackage);

// ── Security & Access Control (Enterprise) ────────────────────────────────
router.use('/security', requireFeature('security'));
router.get  ('/security/cameras',          getCameras);
router.post ('/security/cameras',          createCamera);
router.put  ('/security/cameras/:id',      updateCamera);
router.delete('/security/cameras/:id',     deleteCamera);
router.get  ('/security/visitors',         getVisitors);
router.post ('/security/visitors',         createVisitor);
router.put  ('/security/visitors/:id',     updateVisitor);
router.delete('/security/visitors/:id',    deleteVisitor);
router.get  ('/security/activity',         getSecurityActivity);
router.post ('/security/activity',         createSecurityActivity);
router.get  ('/security/sessions',         getUserSessions);
router.delete('/security/sessions/:id',    revokeSession);

// ── Reports ───────────────────────────────────────────────────────────────────
// Basic reports: all plans | Advanced: Professional+ | AI: Enterprise only
router.get('/reports/revenue',    getRevenueReport);
router.get('/reports/occupancy',  getOccupancyReport);
router.get('/reports/sources',    requireFeature('analytics'), getBookingSourceReport);
router.get('/reports/ai-insights',requireFeature('revenue'), getRevenueAIInsights);

// ── Channel Manager (Professional+) ──────────────────────────────────────────
router.use('/channels', requireFeature('channel'));
router.get ('/channels',      getChannelStatus);
router.post('/channels/sync', syncChannels);

module.exports = router;
