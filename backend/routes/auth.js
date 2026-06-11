// src/routes/auth.js
const router = require('express').Router();
const { register, login, logout, getMe, updatePassword, forgotPassword, resetPassword, registerHotel } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');

router.post('/register',                    register);
router.post('/register-hotel',              upload.single('document'), registerHotel);
router.post('/login',                       login);
router.post('/logout',     protect,         logout);
router.get ('/me',         protect,         getMe);
router.put ('/updatepassword', protect,     updatePassword);
router.post('/forgotpassword',              forgotPassword);
router.put ('/resetpassword/:token',        resetPassword);

module.exports = router;
