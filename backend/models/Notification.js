const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'booking', 'maintenance', 'payment', 'other'],
    default: 'system'
  },
  icon: {
    type: String,
    default: 'bell'
  },
  color: {
    type: String,
    default: 'var(--text2)'
  },
  targetRoles: [{
    type: String
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  relatedRoom: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
