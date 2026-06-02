const mongoose = require('mongoose');

const LaundryItemSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  qty:   { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
}, { _id: false });

const LaundryOrderSchema = new mongoose.Schema({
  hotel:    { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  room:     { type: String, required: true },
  guest:    { type: String, default: 'Guest' },
  items:    { type: [LaundryItemSchema], required: true },
  status:   {
    type: String,
    enum: ['picked', 'washing', 'drying', 'ready', 'delivered'],
    default: 'picked',
  },
  express:  { type: Boolean, default: false },
  amount:   { type: Number, required: true },
  pickup:   { type: String },
  orderId:  { type: String },
}, { timestamps: true });

LaundryOrderSchema.index({ hotel: 1, createdAt: -1 });

module.exports = mongoose.model('LaundryOrder', LaundryOrderSchema);
