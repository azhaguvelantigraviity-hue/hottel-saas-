const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'resolved'],
    default: 'unread'
  }
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
