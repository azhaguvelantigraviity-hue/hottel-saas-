const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatbotController = require('../controllers/smartChatbotController');

// Main intent detection
router.post('/query', protect, chatbotController.detectIntent);

// Specific module data endpoints (called by frontend based on intent)
router.post('/maintenance', protect, chatbotController.getMaintenanceData);
router.post('/rooms', protect, chatbotController.getRoomsData);
router.post('/bookings', protect, chatbotController.getBookingsData);
router.post('/payments', protect, chatbotController.getPaymentsData);
router.post('/food-orders', protect, chatbotController.getFoodOrdersData);
router.post('/employees', protect, chatbotController.getAttendanceData);
router.post('/housekeeping', protect, chatbotController.getHousekeepingData);
router.post('/reports', protect, chatbotController.getReportsData);
router.post('/notifications', protect, chatbotController.getNotificationsData);
router.post('/travel-desk', protect, chatbotController.getTravelDeskData);
router.post('/branches', protect, chatbotController.getBranchesData);
router.post('/analytics', protect, chatbotController.getAnalyticsData);
router.post('/summary', protect, chatbotController.getSummaryData);

module.exports = router;
