const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/:id/read', notificationController.markAsRead);

module.exports = router;
