const Notification = require('../models/Notification');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

exports.getNotifications = asyncHandler(async (req, res) => {
  const role = req.user.role === 'platform_admin' ? 'admin' : req.user.role;
  let filter = {};

  if (role !== 'admin') {
    filter = {
      $or: [
        { hotel: req.hotelId, targetRoles: { $in: [role] } },
        { hotel: req.hotelId, targetRoles: { $size: 0 } }, // if no roles specified, everyone in hotel gets it
        { isGlobal: true, targetRoles: { $in: [role] } },
        { isGlobal: true, targetRoles: { $size: 0 } }
      ]
    };
  } else {
    filter = { hotel: req.hotelId };
  }

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);

  // Format them for the frontend
  const formatted = notifications.map(n => ({
    id: n._id,
    type: n.type,
    title: n.title,
    desc: n.desc,
    time: n.createdAt,
    read: n.readBy.includes(req.user._id),
    color: n.color,
    icon: n.icon,
    relatedRoom: n.relatedRoom
  }));

  sendSuccess(res, formatted);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    { $addToSet: { readBy: req.user._id } },
    { new: true }
  );
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  sendSuccess(res, notif);
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  const role = req.user.role === 'platform_admin' ? 'admin' : req.user.role;
  let filter = {};
  
  if (role !== 'admin') {
    filter = {
      $or: [
        { hotel: req.hotelId, targetRoles: { $in: [role] } },
        { hotel: req.hotelId, targetRoles: { $size: 0 } },
        { isGlobal: true, targetRoles: { $in: [role] } },
        { isGlobal: true, targetRoles: { $size: 0 } }
      ]
    };
  } else {
    filter = { hotel: req.hotelId };
  }

  await Notification.updateMany(
    filter,
    { $addToSet: { readBy: req.user._id } }
  );

  sendSuccess(res, { message: 'All notifications marked as read' });
});
