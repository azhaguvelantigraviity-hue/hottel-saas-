const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  hotel:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  employee:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month:       { type: String, required: true }, // e.g. "2026-06"
  baseSalary:  { type: Number, default: 0 },
  workingDays: { type: Number, default: 30 },
  paidDays:    { type: Number, default: 0 },
  overtime:    { type: Number, default: 0 },
  bonus:       { type: Number, default: 0 },
  deductions:  { type: Number, default: 0 },
  advance:     { type: Number, default: 0 },
  netSalary:   { type: Number, default: 0 },
  status:      { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paidDate:    { type: Date },
  payslipData: { type: Object } // Snapshot of payslip generated at calculation
}, { timestamps: true });

// Compound index to ensure uniqueness per employee per month
PayrollSchema.index({ hotel: 1, employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
