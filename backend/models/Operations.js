const mongoose = require('mongoose');

// ── Employee ──────────────────────────────────────────────────
const EmployeeSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  name:       { type: String, required: true },
  email:      String,
  phone:      String,
  department: { type: String, required: true },
  role:       { type: String, required: true },
  shift:      { type: String, enum: ['Morning','Evening','Night'], default: 'Morning' },
  salary:     { type: Number, default: 0 },
  status:     { type: String, enum: ['active','inactive','on_leave'], default: 'active' },
  joinedAt:   { type: Date, default: Date.now },
  avatar:     String,
}, { timestamps: true });

// ── Attendance ────────────────────────────────────────────────
const AttendanceSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date:       { type: Date, required: true },
  checkIn:    String,
  checkOut:   String,
  status:     { type: String, enum: ['present','absent','leave','late'], default: 'present' },
  hours:      Number,
  overtime:   { type: Number, default: 0 },
  notes:      String,
}, { timestamps: true });

// ── Housekeeping Task ─────────────────────────────────────────
const HousekeepingSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  room:       { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  roomNumber: String,
  type:       { type: String, enum: ['Full Clean','Turndown','Inspection','Linen Change','Minibar Restock','Deep Clean'], default: 'Full Clean' },
  assignedTo: String,
  priority:   { type: String, enum: ['high','medium','low'], default: 'medium' },
  status:     { type: String, enum: ['pending','in-progress','completed','verified'], default: 'pending' },
  notes:      String,
  scheduledAt:Date,
  completedAt:Date,
}, { timestamps: true });

// ── Maintenance Ticket ────────────────────────────────────────
const MaintenanceSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  ticketId:   { type: String, unique: true },
  room:       String,
  issue:      { type: String, required: true },
  category:   { type: String, enum: ['HVAC','Plumbing','Electronics','Elevator','Furniture','Electrical','Other'], default: 'Other' },
  priority:   { type: String, enum: ['high','medium','low'], default: 'medium' },
  status:     { type: String, enum: ['open','in-progress','resolved','closed'], default: 'open' },
  assignedTo: String,
  reportedBy: String,
  notes:      String,
  resolvedAt: Date,
}, { timestamps: true });

MaintenanceSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Maintenance').countDocuments({ hotel: this.hotel });
    this.ticketId = `MT-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// ── POS Order ─────────────────────────────────────────────────
const POSOrderSchema = new mongoose.Schema({
  hotel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  orderId:    { type: String, unique: true },
  table:      String,
  type:       { type: String, enum: ['dine-in','room-service','takeaway'], default: 'dine-in' },
  items:      [{ name: String, qty: Number, price: Number }],
  subtotal:   Number,
  tax:        { type: Number, default: 0 },
  total:      { type: Number, required: true },
  status:     { type: String, enum: ['pending','preparing','delivered','cancelled'], default: 'pending' },
  booking:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  addedToRoom:{ type: Boolean, default: false },
}, { timestamps: true });

POSOrderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('POSOrder').countDocuments({ hotel: this.hotel });
    this.orderId = `ORD-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = {
  Employee:    mongoose.model('Employee',    EmployeeSchema),
  Attendance:  mongoose.model('Attendance',  AttendanceSchema),
  Housekeeping:mongoose.model('Housekeeping',HousekeepingSchema),
  Maintenance: mongoose.model('Maintenance', MaintenanceSchema),
  POSOrder:    mongoose.model('POSOrder',    POSOrderSchema),
};
