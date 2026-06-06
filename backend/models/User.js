const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['platform_admin','hotel_admin','hotel_staff'], default: 'hotel_staff' },
  department: { type: String, enum: ['Housekeeping', 'Maintenance', 'Front Desk', 'Restaurant', 'Manager', 'None'], default: 'None' },
  hotel:    { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  isActive: { type: Boolean, default: true },
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Sign JWT
UserSchema.methods.getSignedJwt = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Compare password
UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
