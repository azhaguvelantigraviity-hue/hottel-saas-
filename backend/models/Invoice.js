const mongoose = require('mongoose');

const SplitPaymentSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash','card','upi','bank_transfer'], default: 'cash' },
});

const InvoiceSchema = new mongoose.Schema({
  hotel:    { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  invoiceNo:{ type: String, unique: true },
  type:     { type: String, enum: ['room','pos','event','advance','other'], default: 'room' },

  guest:      { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  guestName:  { type: String, required: true },
  guestEmail: String,
  guestPhone: String,

  booking:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  roomNumber: String,
  checkIn:    Date,
  checkOut:   Date,
  nights:     Number,

  roomCharges:    { type: Number, default: 0 },
  foodCharges:    { type: Number, default: 0 },
  laundryCharges: { type: Number, default: 0 },
  spaCharges:     { type: Number, default: 0 },
  otherCharges:   { type: Number, default: 0 },
  posCharges:     { type: Number, default: 0 },

  posOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'POSOrder' }],

  subtotal:       { type: Number, default: 0 },
  discountType:   { type: String, enum: ['none','percentage','fixed'], default: 'none' },
  discountValue:  { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxRate:        { type: Number, default: 18 },
  taxAmount:      { type: Number, default: 0 },
  totalAmount:    { type: Number, required: true },

  paidAmount:   { type: Number, default: 0 },
  dueAmount:    { type: Number, default: 0 },
  paymentStatus:{ type: String, enum: ['pending','partial','paid','cancelled','refunded'], default: 'pending' },
  paymentMethod:{ type: String, enum: ['cash','card','upi','bank_transfer','split'], default: 'cash' },
  paymentDate:  Date,

  splitPayments: [SplitPaymentSchema],

  refundAmount: { type: Number, default: 0 },
  refundReason: String,
  refundDate:   Date,

  status:    { type: String, enum: ['draft','issued','paid','cancelled','refunded'], default: 'draft' },
  notes:     String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

InvoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNo) {
    const count = await mongoose.model('Invoice').countDocuments({ hotel: this.hotel });
    this.invoiceNo = `INV-${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

InvoiceSchema.index({ hotel: 1, invoiceNo: 1 }, { unique: true });
InvoiceSchema.index({ hotel: 1, status: 1 });
InvoiceSchema.index({ hotel: 1, createdAt: -1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
