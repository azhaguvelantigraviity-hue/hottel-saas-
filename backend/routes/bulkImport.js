const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseBulkImport, saveBulkImport, uploadItemImage } = require('../controllers/bulkImportController');
const { protect, scopeToHotel } = require('../middleware/auth');
const { requireFeature } = require('../middleware/planGate');

const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `bulk-${Date.now()}${ext}`);
  },
});

const excelFilter = (req, file, cb) => {
  const allowed = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'), false);
};

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `item-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error('Only image files (jpg, png, gif, webp) are allowed'), false);
};

const uploadExcel = multer({ storage: tempStorage, fileFilter: excelFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } });

router.use(protect, scopeToHotel, requireFeature('restaurant'));

router.post('/parse', uploadExcel.single('file'), parseBulkImport);
router.post('/upload-image', uploadImage.single('image'), uploadItemImage);
router.post('/save', saveBulkImport);

module.exports = router;
