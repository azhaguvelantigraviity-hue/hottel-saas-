const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  hotelName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) { return !v || /^\d{10}$/.test(v); },
      message: props => `Phone number must be exactly 10 digits.`
    }
  },
  address: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  totalRooms: { type: Number, required: true, min: 1 },
  plan: { type: String, enum: ['starter','professional','enterprise'], default: 'starter' },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
