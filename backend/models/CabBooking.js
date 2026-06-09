const mongoose = require('mongoose');

const CabBookingSchema = new mongoose.Schema({
  hotel:         { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  guest:         { type: String, required: true },
  room:          { type: String, default: '' },
  bookingId:     { type: String, unique: true },

  type:          { type: String, enum: ['cab', 'airport'], default: 'cab' },

  pickupLocation:{ type: String, required: true },
  destination:   { type: String, default: '' },
  date:          { type: Date, required: true },
  time:          { type: String, required: true },
  vehicleType:   { type: String, default: 'Sedan' },

  flightNumber:  { type: String, default: '' },
  transferType:  { type: String, enum: ['pickup', 'drop', ''], default: '' },

  status:        { type: String, enum: ['pending','confirmed','in-progress','completed','cancelled'], default: 'pending' },
  amount:        { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  notes:         { type: String, default: '' },

  driverName:    { type: String, default: '' },
  driverPhone:   { 
    type: String, 
    default: '',
    validate: {
      validator: function(v) { return !v || /^\d{10}$/.test(v); },
      message: props => `Phone number must be exactly 10 digits.`
    }
  },
  vehicleNumber: { type: String, default: '' },

  agency:        { type: mongoose.Schema.Types.ObjectId, ref: 'TravelAgency' },
  vehicleId:     { type: mongoose.Schema.Types.ObjectId },
  driverId:      { type: mongoose.Schema.Types.ObjectId }

}, { timestamps: true });

CabBookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('CabBooking').countDocuments({ hotel: this.hotel });
    this.bookingId = `CB-${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

CabBookingSchema.index({ hotel: 1, status: 1 });
CabBookingSchema.index({ hotel: 1, date: 1 });

module.exports = mongoose.model('CabBooking', CabBookingSchema);
