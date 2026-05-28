// src/routes/auth.js
const router = require('express').Router();
const { register, login, logout, getMe, updatePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',                    register);
router.post('/login',                       login);
router.post('/logout',     protect,         logout);
router.get ('/me',         protect,         getMe);
router.put ('/updatepassword', protect,     updatePassword);
router.post('/forgotpassword',              forgotPassword);
router.put ('/resetpassword/:token',        resetPassword);

module.exports = router;
