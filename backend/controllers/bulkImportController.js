const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const MenuItem = require('../models/MenuItem');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

const VALID_CATEGORIES = ['Breakfast','Starters','Main Course','Breads','Desserts','Beverages','Snacks','Custom'];

function parseRows(rows) {
  return rows.map((row, i) => {
    const name = (row['Item Name'] || row.name || row.Name || row.NAME || row.item || row.Item || '').toString().trim();
    const price = parseFloat(row.Price || row.price || row.PRICE || row.rate || row.Rate || 0);
    const rawCat = (row.Category || row.category || row.CATEGORY || row.cat || row.Cat || '').toString().trim();
    const desc = (row.Description || row.description || row.DESCRIPTION || row.desc || row.Desc || '').toString().trim();
    
    // Status can be Available/Unavailable, Active/Inactive, or boolean
    let rawStatus = row.Status || row.status || row.available;
    const available = rawStatus !== undefined ? [true, 1, 'true', 'yes', 'Yes', 'TRUE', 'available', 'Available', 'Active'].includes(rawStatus) : true;
    
    const stock = parseInt(row.Stock || row.stock || row.STOCK || row.qty || row.Qty || 0) || 0;
    const imageUrl = (row['Image URL'] || row.image || row.Image || row.imageUrl || '').toString().trim();

    const errors = [];
    if (!name) errors.push('Item name is required');
    if (!price || price <= 0) errors.push('Valid price is required');

    let category = VALID_CATEGORIES.find(c => c.toLowerCase() === rawCat.toLowerCase());
    if (!category && rawCat) category = 'Custom';
    if (!rawCat) category = 'Custom';

    return {
      _tempId: `temp_${Date.now()}_${i}`,
      row: i + 1,
      name,
      price,
      category,
      description: desc,
      available,
      stock,
      errors,
      image: imageUrl || null,
    };
  });
}

const parseBulkImport = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file' });
  }

  const filePath = req.file.path;
  let items = [];

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    items = parseRows(rows);
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Failed to parse file: ' + err.message });
  } finally {
    fs.unlink(filePath, () => {});
  }

  // Duplicate Check
  const existingItems = await MenuItem.find({ hotel: req.hotelId }).select('name').lean();
  const existingNames = new Set(existingItems.map(i => i.name.toLowerCase()));

  for (const item of items) {
    if (existingNames.has(item.name.toLowerCase())) {
      item.errors.push(`Duplicate: An item named "${item.name}" already exists in the menu`);
    }
  }

  const validItems = items.filter(i => i.errors.length === 0);
  const invalidItems = items.filter(i => i.errors.length > 0);

  for (const item of validItems) {
    if (!item.image) {
      try {
        const searchQuery = encodeURIComponent(item.name + ' food recipe');
        item.image = `https://source.unsplash.com/400x300/?${searchQuery}`;
      } catch {
        item.image = null;
      }
    }
  }

  sendSuccess(res, {
    total: items.length,
    valid: validItems.length,
    invalid: invalidItems.length,
    items: validItems,
    errors: invalidItems.map(i => ({ row: i.row, name: i.name, errors: i.errors })),
  });
});

const saveBulkImport = asyncHandler(async (req, res) => {
  const { items, imageOverrides } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items provided' });
  }

  const created = [];
  const errors = [];

  for (const item of items) {
    try {
      let imageUrl = item.image || null;

      if (imageOverrides && imageOverrides[item.name]) {
        imageUrl = imageOverrides[item.name];
      }

      const menuItem = await MenuItem.create({
        hotel: req.hotelId,
        name: item.name,
        price: item.price,
        category: item.category || 'Custom',
        description: item.description || '',
        available: item.available !== false,
        stock: item.stock || 0,
        image: imageUrl,
      });
      created.push(menuItem);
    } catch (err) {
      errors.push({ name: item.name, error: err.message });
    }
  }

  sendSuccess(res, { created: created.length, failed: errors.length, items: created, errors }, 201);
});

const uploadItemImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const url = `/uploads/${req.file.filename}`;
  sendSuccess(res, { url, filename: req.file.filename });
});

module.exports = { parseBulkImport, saveBulkImport, uploadItemImage };
