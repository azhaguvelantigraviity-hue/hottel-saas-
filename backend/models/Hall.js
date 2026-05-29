const mongoose = require('mongoose');

const HallSchema = new mongoose.Schema({
  hotel:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  name:        { type: String, required: true },
  capacity:    { type: Number, required: true },
  description: String,
  rate:        { type: Number, required: true },
  amenities:   [String],
  images:      [String],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

HallSchema.index({ hotel: 1, name: 1 });

module.exports = mongoose.model('Hall', HallSchema);
