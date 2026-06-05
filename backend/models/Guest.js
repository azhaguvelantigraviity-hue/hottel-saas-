const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  hotel:        { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, required: true, trim: true },
  email:        { type: String, lowercase: true, trim: true },
  phone:        {
    type: String,
    validate: {
      validator: function(v) { return !v || /^\d{10}$/.test(v); },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  nationality:  { type: String, default: 'Indian' },
  idType:       { type: String, enum: ['aadhaar','passport','driving_license','voter_id'], default: 'aadhaar' },
  idNumber:     String,
  dateOfBirth:  Date,
  address:      String,
  source:       { type: String, default: 'Direct' },
  totalStays:   { type: Number, default: 0 },
  totalSpent:   { type: Number, default: 0 },
  loyaltyPoints:{ type: Number, default: 0 },
  loyaltyTier:  { type: String, enum: ['Bronze','Silver','Gold','Platinum'], default: 'Bronze' },
  preferences:  String,
  notes:        String,
  hasPet:       { type: Boolean, default: false },
  petType:      String,
  isBlacklisted:{ type: Boolean, default: false },
}, { timestamps: true });

GuestSchema.index({ hotel: 1, email: 1 });

module.exports = mongoose.model('Guest', GuestSchema);
