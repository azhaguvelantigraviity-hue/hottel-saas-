// src/routes/admin.js
const router = require('express').Router();
const {
  getDashboard, getAllHotels, getHotel, createHotel, updateHotel,
  updateSubscription, deleteHotel, getPlatformRevenue, getAuditLogs,
  getAllUsers, createUser, updateUser, deleteUser, getPlatformStats,
  getRenewalAlerts, getRoles, createRole, updateRole, deleteRole
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
router.get  ('/alerts/renewals',         getRenewalAlerts);
router.get  ('/audit-logs',              getAuditLogs);

// Plans routes
const { getPlans, updatePlan } = require('../controllers/adminController');
router.get  ('/plans',                   getPlans);
router.put  ('/plans/:id',               updatePlan);

router.get  ('/users',                   getAllUsers);
router.post ('/users',                   createUser);
router.put  ('/users/:id',               updateUser);
router.delete('/users/:id',              deleteUser);

// Roles routes
router.get   ('/roles',     getRoles);
router.post  ('/roles',     createRole);
router.put   ('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

router.get  ('/stats/overview',          getPlatformStats);

// Branch routes
const {
  getAllBranches, createBranch, updateBranch, deleteBranch
} = require('../controllers/adminController');

router.get   ('/branches',      getAllBranches);
router.post  ('/branches',      createBranch);
router.put   ('/branches/:id',  updateBranch);
router.delete('/branches/:id',  deleteBranch);

// Admin Notifications
const { 
  getAdminNotifications, 
  markAdminNotificationRead,
  resolveAdminNotification,
  deleteAdminNotification
} = require('../controllers/adminController');

router.get('/notifications', getAdminNotifications);
router.put('/notifications/:id/read', markAdminNotificationRead);
router.put('/notifications/:id/resolve', resolveAdminNotification);
router.delete('/notifications/:id', deleteAdminNotification);

// Registrations
const { getRegistrations, approveRegistration, rejectRegistration } = require('../controllers/adminController');
router.get('/registrations', getRegistrations);
router.put('/registrations/:id/approve', approveRegistration);
router.put('/registrations/:id/reject', rejectRegistration);

module.exports = router;
