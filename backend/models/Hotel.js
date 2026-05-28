const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  phone:      String,
  website:    String,
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: {
    street:  String,
    city:    { type: String, required: true },
    state:   String,
    country: { type: String, default: 'India' },
    pincode: String,
  },
  plan:       { type: String, enum: ['starter','professional','enterprise'], default: 'starter' },
  planStatus: { type: String, enum: ['active','trial','suspended','cancelled'], default: 'trial' },
  totalRooms: { type: Number, default: 0 },
  subscriptionStart: { type: Date, default: Date.now },
  nextPaymentAt:     Date,
  logo:       String,
  timezone:   { type: String, default: 'Asia/Kolkata' },
  currency:   { type: String, default: 'INR' },
  gstNumber:  String,
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Hotel', HotelSchema);
