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
const AdminNotification = require('../models/AdminNotification');

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
      targetRoles: notif.targetRoles,
      isGlobal: notif.isGlobal
    };

    // Emit via Socket.IO
    const io = req.app.get('io');
    if (io) {
      if (data.isGlobal) {
        if (data.targetRoles && data.targetRoles.length > 0) {
          data.targetRoles.forEach(role => io.to(`global_${role}`).emit('newNotification', formatted));
        } else {
          io.emit('newNotification', formatted);
        }
      } else if (data.hotel) {
        if (data.targetRoles && data.targetRoles.length > 0) {
          data.targetRoles.forEach(role => io.to(`hotel_${data.hotel}_${role}`).emit('newNotification', formatted));
          io.to(data.hotel.toString()).emit('newNotification', formatted); // Fallback for backwards compatibility
        } else {
          io.to(data.hotel.toString()).emit('newNotification', formatted);
        }
      }
    }

    // Also dispatch an AdminNotification if it targets platform_admin
    if (data.targetRoles && data.targetRoles.includes('platform_admin')) {
      let adminType = 'system';
      if (data.type === 'booking') adminType = 'checkout';
      else if (data.type === 'payment') adminType = 'payment';
      else if (data.type === 'maintenance') adminType = 'maintenance';
      else if (data.title.toLowerCase().includes('subscription')) adminType = 'subscription';
      else if (data.title.toLowerCase().includes('help')) adminType = 'help_request';

      const adminNotif = await AdminNotification.create({
        hotelId: data.hotel,
        managerId: req.user ? req.user.id : null,
        type: adminType,
        title: data.title,
        message: data.desc,
        status: 'unread'
      });

      const populatedAdminNotif = await adminNotif.populate('hotelId', 'name phone').populate('managerId', 'name email phone');

      if (io) {
        io.to('adminRoom').emit('newAdminNotification', populatedAdminNotif);
      }
    }

  } catch (err) {
    console.error('Error emitting notification:', err);
  }
};

module.exports = { emitNotification };
