const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  visitorId:  { type: String, unique: true },
  name:       { type: String, required: true },
  purpose:    { type: String, required: true },
  host:       { type: String, required: true },
  checkIn:    { type: String, required: true },
  checkOut:   { type: String, default: '' },
  idVerified: { type: Boolean, default: false },
  phone:      {
    type: String,
    validate: {
      validator: function(v) { return !v || /^\d{10}$/.test(v); },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  vehicle:    { type: String, default: '' },
  notes:      String,
}, { timestamps: true });

VisitorSchema.pre('save', async function (next) {
  if (!this.visitorId) {
    const count = await mongoose.model('Visitor').countDocuments({ hotel: this.hotel });
    this.visitorId = `VIS-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Visitor', VisitorSchema);
