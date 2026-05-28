const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomNumber: { type: String, required: true },
  floor:      { type: Number, default: 1 },
  type:       { type: String, enum: ['Standard Twin','Deluxe King','Deluxe Queen','Suite','Premium Suite','Presidential Suite'], required: true },
  status:     { type: String, enum: ['available','occupied','reserved','maintenance','cleaning'], default: 'available' },
  baseRate:   { type: Number, required: true },
  maxAdults:  { type: Number, default: 2 },
  maxChildren:{ type: Number, default: 2 },
  housekeepingStatus: { type: String, enum: ['clean','dirty','inspect'], default: 'clean' },
  amenities:  [String],
  description:String,
  images:     [String],
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

RoomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', RoomSchema);
