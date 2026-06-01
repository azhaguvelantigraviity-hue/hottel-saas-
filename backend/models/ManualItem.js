const mongoose = require('mongoose');

const ManualItemSchema = new mongoose.Schema({
  hotel:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  category:    { type: String, required: true, enum: ['Breakfast','Starters','Main Course','Breads','Desserts','Beverages','Snacks','Custom'] },
  description: String,
  available:   { type: Boolean, default: true },
  image:       String,
}, { timestamps: true });

ManualItemSchema.index({ hotel: 1, category: 1 });

module.exports = mongoose.model('ManualItem', ManualItemSchema);
