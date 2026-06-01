const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  hotel:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  category:    { type: String, required: true, enum: ['Breakfast','Starters','Main Course','Breads','Desserts','Beverages','Snacks','Custom'] },
  description: String,
  available:   { type: Boolean, default: true },
  stock:       { type: Number, default: 0 },
  image:       String,
}, { timestamps: true });

MenuItemSchema.index({ hotel: 1, category: 1 });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
