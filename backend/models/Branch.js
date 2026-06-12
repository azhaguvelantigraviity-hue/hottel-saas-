const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  hotelName: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  managerName: { type: String, trim: true },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) { return !v || /^\d{10}$/.test(v); },
      message: props => `Phone number must be exactly 10 digits.`
    }
  },
  email: { type: String, trim: true, lowercase: true },
  totalRooms: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Branch', BranchSchema);
