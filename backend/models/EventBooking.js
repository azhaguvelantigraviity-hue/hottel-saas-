const mongoose = require('mongoose');

const EventBookingSchema = new mongoose.Schema({
  hotel:            { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  bookingId:        { type: String, unique: true },
  eventName:        { type: String, required: true },
  hall:             { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  hallName:         String,
  clientName:       { type: String, required: true },
  clientPhone:      String,
  clientEmail:      String,
  date:             { type: Date, required: true },
  startTime:        String,
  endTime:          String,
  guests:           { type: Number, required: true },
  cateringPackage:  String,
  cateringPrice:    { type: Number, default: 0 },
  hallRate:         { type: Number, default: 0 },
  totalAmount:      { type: Number, required: true },
  paidAmount:       { type: Number, default: 0 },
  status:           { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  notes:            String,
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

EventBookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('EventBooking').countDocuments({ hotel: this.hotel });
    this.bookingId = `EVT-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

EventBookingSchema.index({ hotel: 1, status: 1 });
EventBookingSchema.index({ hotel: 1, date: 1 });

module.exports = mongoose.model('EventBooking', EventBookingSchema);
