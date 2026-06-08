const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  bookingId: { type: String, required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  docType: { type: String, enum: ['Aadhaar', 'Passport', 'Driving License', 'PAN', 'Other'], default: 'Aadhaar' },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

DocumentSchema.index({ hotel: 1, bookingId: 1 });
DocumentSchema.index({ guestId: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
