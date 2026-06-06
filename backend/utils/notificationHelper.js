const Notification = require('../models/Notification');

/**
 * Creates a notification in the database and emits it via socket.io
 * @param {Object} req - The Express request object (to access req.app.get('io'))
 * @param {Object} data - Notification data
 * @param {String} data.hotel - Hotel ObjectId
 * @param {String} data.title - Notification title
 * @param {String} data.desc - Notification description
 * @param {String} data.type - system, booking, maintenance, payment, other
 * @param {String} data.icon - Icon name
 * @param {String} data.color - CSS color variable
 * @param {Array} data.targetRoles - e.g. ['admin', 'manager', 'staff']
 * @param {String} [data.relatedRoom] - Optional related room number
 */
const emitNotification = async (req, data) => {
  try {
    const notif = await Notification.create(data);
    
    const formatted = {
      id: notif._id,
      type: notif.type,
      title: notif.title,
      desc: notif.desc,
      time: notif.createdAt,
      read: false,
      color: notif.color,
      icon: notif.icon,
      relatedRoom: notif.relatedRoom,
      targetRoles: notif.targetRoles
    };

    // Emit to the hotel room
    const io = req.app.get('io');
    if (io) {
      io.to(data.hotel.toString()).emit('newNotification', formatted);
    }
  } catch (err) {
    console.error('Error emitting notification:', err);
  }
};

module.exports = { emitNotification };
