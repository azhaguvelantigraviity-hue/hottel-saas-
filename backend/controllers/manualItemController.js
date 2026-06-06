const ManualItem = require('../models/ManualItem');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

// Get all manual items
exports.getItems = asyncHandler(async (req, res) => {
  const filter = { hotel: req.hotelId };
  if (req.query.category) filter.category = req.query.category;
  
  const items = await ManualItem.find(filter).sort('category name');
  sendSuccess(res, items);
});

// Create item
exports.createItem = asyncHandler(async (req, res) => {
  const existingItem = await ManualItem.findOne({ 
    hotel: req.hotelId, 
    name: new RegExp(`^${req.body.name}$`, 'i'),
    category: req.body.category 
  });
  
  if (existingItem) {
    return res.status(400).json({ success: false, message: `An item named "${req.body.name}" already exists in the ${req.body.category} category.` });
  }

  const item = await ManualItem.create({ ...req.body, hotel: req.hotelId });
  
  const io = req.app.get('io');
  if (io) {
    io.to(req.hotelId.toString()).emit('manualItemChanged', { action: 'create', item });
  }
  
  sendSuccess(res, item, 201);
});

// Update item
exports.updateItem = asyncHandler(async (req, res) => {
  const item = await ManualItem.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(req.hotelId.toString()).emit('manualItemChanged', { action: 'update', item });
  }

  sendSuccess(res, item);
});

// Delete item
exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await ManualItem.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(req.hotelId.toString()).emit('manualItemChanged', { action: 'delete', id: req.params.id });
  }

  sendSuccess(res, null, 204);
});
