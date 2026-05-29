const mongoose = require('mongoose');

const CameraSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  cameraId:   { type: String, unique: true },
  location:   { type: String, required: true },
  status:     { type: String, enum: ['live', 'offline', 'maintenance'], default: 'live' },
  type:       { type: String, default: 'Dome 4K' },
  lastMotion: { type: String, default: 'N/A' },
  recording:  { type: Boolean, default: true },
}, { timestamps: true });

CameraSchema.pre('save', async function (next) {
  if (!this.cameraId) {
    const count = await mongoose.model('Camera').countDocuments({ hotel: this.hotel });
    this.cameraId = `CAM-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Camera', CameraSchema);
