const mongoose = require('mongoose');

const TravelPackageSchema = new mongoose.Schema({
  hotel:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  duration:    { type: String, default: '' },
  price:       { type: Number, default: 0 },
  includes:    [String],
  highlights:  [String],
  active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('TravelPackage', TravelPackageSchema);
