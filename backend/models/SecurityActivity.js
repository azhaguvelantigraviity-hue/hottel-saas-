const mongoose = require('mongoose');

const SecurityActivitySchema = new mongoose.Schema({
  hotel:   { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  type:    { type: String, enum: ['login', 'booking', 'housekeeping', 'payment', 'system'], required: true },
  action:  { type: String, required: true },
  detail:  String,
  user:    String,
  ip:      String,
  time:    String,
}, { timestamps: true });

module.exports = mongoose.model('SecurityActivity', SecurityActivitySchema);
