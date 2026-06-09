const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  type: { type: String, required: true },
  model: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  capacity: { type: Number, default: 4 },
  pricePerKm: { type: Number, default: 0 },
  pricePerDay: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Booked', 'Maintenance'], default: 'Available' }
});

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  status: { type: String, enum: ['Available', 'On Duty'], default: 'Available' }
});

const TravelAgencySchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  planType: { type: String, default: 'enterprise' },
  agencyName: { type: String, required: true },
  contactPerson: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  vehicles: [VehicleSchema],
  drivers: [DriverSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

TravelAgencySchema.index({ hotel: 1 });

module.exports = mongoose.model('TravelAgency', TravelAgencySchema);
