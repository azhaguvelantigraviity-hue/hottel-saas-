const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  hotel:         { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  room:          { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  required: true },
  guest:         { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookingId:     { type: String, unique: true },
  checkIn:       { type: Date, required: true },
  checkOut:      { type: Date, required: true },
  nights:        { type: Number, required: true },
  adults:        { type: Number, default: 1 },
  children:      { type: Number, default: 0 },
  roomRate:      { type: Number, required: true },
  petCharge:     { type: Number, default: 0 },
  hasPet:        { type: Boolean, default: false },
  petType:       String,
  foodCharges:   { type: Number, default: 0 },
  laundryCharges:{ type: Number, default: 0 },
  otherCharges:  { type: Number, default: 0 },
  taxRate:       { type: Number, default: 18 },
  taxAmount:     { type: Number, default: 0 },
  totalAmount:   { type: Number, required: true },
  paidAmount:    { type: Number, default: 0 },
  status:        { type: String, enum: ['pending','confirmed','checked_in','checked_out','cancelled','no_show'], default: 'confirmed' },
  paymentStatus: { type: String, enum: ['pending','partial','paid','refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash','card','upi','bank_transfer','online'], default: 'cash' },
  source:        { type: String, default: 'Direct' },
  specialRequests: String,
  checkedInAt:   Date,
  checkedOutAt:  Date,
  cancelledAt:   Date,
  cancelReason:  String,

  // ── Smart Check-In Process ─────────────────────────────────
  checkInProcess: {
    qrCode:      { type: String, default: '' },
    qrGeneratedAt: Date,

    guestDetails: {
      name:    String,
      phone:   String,
      email:   String,
      address: String,
      updatedAt: Date,
    },

    idScan: {
      idType:   { type: String, enum: ['aadhaar','passport','driving_license','voter_id'], default: 'aadhaar' },
      idNumber: String,
      documentImage: String,
      verified: { type: Boolean, default: false },
      scannedAt: Date,
    },

    faceVerification: {
      status:    { type: String, enum: ['idle','capturing','verified','failed'], default: 'idle' },
      imageData: String,
      verifiedAt: Date,
    },

    digitalSignature: {
      signature: String,
      signedAt:  Date,
    },

    stepsCompleted: {
      qrScanned:    { type: Boolean, default: false },
      detailsFilled:{ type: Boolean, default: false },
      idScanned:    { type: Boolean, default: false },
      faceVerified: { type: Boolean, default: false },
      signatureDone:{ type: Boolean, default: false },
    },
  },
}, { timestamps: true });

// Auto-generate booking ID
BookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments({ hotel: this.hotel });
    this.bookingId = `BK-${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

// Duplicate index removed

BookingSchema.index({ hotel: 1, status: 1 });
BookingSchema.index({ hotel: 1, checkIn: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
