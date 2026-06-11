const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel' // Optional: some platform alerts might not be tied to a hotel
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Optional: who triggered it
  },
  type: {
    type: String,
    enum: ['help_request', 'checkout', 'payment', 'maintenance', 'subscription', 'system', 'staff'],
    default: 'system'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'unread', 'read', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
