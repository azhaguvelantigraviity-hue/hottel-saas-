const mongoose = require('mongoose');

const CateringPackageSchema = new mongoose.Schema({
  hotel:        { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  name:         { type: String, required: true },
  pricePerHead: { type: Number, required: true },
  items:        [String],
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

CateringPackageSchema.index({ hotel: 1, name: 1 });

module.exports = mongoose.model('CateringPackage', CateringPackageSchema);
