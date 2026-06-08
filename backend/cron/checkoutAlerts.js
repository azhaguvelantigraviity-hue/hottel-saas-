const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { emitNotification } = require('../utils/notificationHelper');

const checkOutAlerts = async (app) => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const reqMock = { app }; // Mock req for emitNotification

    // 1. Near Checkout Alerts (within 1 hour)
    const nearCheckouts = await Booking.find({
      status: 'checked_in',
      checkOutDateTime: { $lte: oneHourFromNow, $gt: now },
      'alertsSent.nearCheckout': false
    }).populate('room');

    for (const booking of nearCheckouts) {
      if (booking.room) {
        await emitNotification(reqMock, {
          hotel: booking.hotel,
          title: 'Checkout Reminder',
          desc: `Room ${booking.room.roomNumber} guest checkout time is near (${new Date(booking.checkOutDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
          type: 'booking',
          icon: 'clock',
          color: 'var(--amber)',
          targetRoles: ['admin', 'manager'],
          relatedRoom: booking.room.roomNumber
        });
      }
      booking.alertsSent = booking.alertsSent || {};
      booking.alertsSent.nearCheckout = true;
      await booking.save();
    }

    // 2. Overdue Checkout Alerts (time passed)
    const overdueCheckouts = await Booking.find({
      status: 'checked_in',
      checkOutDateTime: { $lte: now },
      'alertsSent.overdue': false
    }).populate('room');

    for (const booking of overdueCheckouts) {
      if (booking.room) {
        await emitNotification(reqMock, {
          hotel: booking.hotel,
          title: 'Overdue Checkout',
          desc: `Room ${booking.room.roomNumber} guest checkout is overdue!`,
          type: 'booking',
          icon: 'alert-triangle',
          color: 'var(--rose)',
          targetRoles: ['admin', 'manager'],
          relatedRoom: booking.room.roomNumber
        });
      }
      booking.alertsSent = booking.alertsSent || {};
      booking.alertsSent.overdue = true;
      await booking.save();
    }

  } catch (err) {
    console.error('Error running checkout alerts cron:', err);
  }
};

const startCheckoutCron = (app) => {
  // Run every 1 minute
  setInterval(() => checkOutAlerts(app), 60 * 1000);
  console.log('Checkout alerts cron job started');
};

module.exports = { startCheckoutCron };
