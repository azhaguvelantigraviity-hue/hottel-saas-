const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true }, // starter, professional, enterprise
  name: { type: String, required: true },
  accent: { type: String, default: '#6B7280' },
  price: { type: Number, required: true },
  features: { type: [String], default: [] },
  missing: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
