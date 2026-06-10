const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  hotelCode:  { type: String, unique: true, sparse: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  phone:      {
    type: String,
    validate: {
      validator: function(v) { return !v || /^\d{10}$/.test(v); },
      message: props => `Phone number must be exactly 10 digits.`
    }
  },
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
  staffCount: { type: Number, default: 0 },
  occupancyRate: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  adminCredentials: {
    email:    String,
    password: String,
    username: String,
  },
  subscriptionStart: { type: Date, default: Date.now },
  trialEndDate:      { type: Date },
  nextPaymentAt:     Date,
  logo:       String,
  timezone:   { type: String, default: 'Asia/Kolkata' },
  currency:   { type: String, default: 'INR' },
  gstNumber:  String,
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Hotel', HotelSchema);
