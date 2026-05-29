const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  device:     { type: String, required: true },
  location:   { type: String, required: true },
  lastActive: { type: String, required: true },
  current:    { type: Boolean, default: false },
  browser:    String,
  ip:         String,
}, { timestamps: true });

module.exports = mongoose.model('UserSession', UserSessionSchema);
