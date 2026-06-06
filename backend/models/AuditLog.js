const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  target: { type: String },
  details: { type: String },
  user: { type: String, required: true },
  ip: { type: String },
  status: { type: String, enum: ['success', 'warning', 'failed'], default: 'success' },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
