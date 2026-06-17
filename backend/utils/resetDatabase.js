// ─────────────────────────────────────────────────────────────
//  StayOS – Full Database Reset Script
//  Creates a JSON backup, then wipes ALL data and re-seeds
//  only the platform admin account.
// ─────────────────────────────────────────────────────────────
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs       = require('fs');
const path     = require('path');

// ── Import every model so Mongoose registers the collections ──
const User               = require('../models/User');
const Hotel              = require('../models/Hotel');
const Room               = require('../models/Room');
const Guest              = require('../models/Guest');
const Booking            = require('../models/Booking');
const Invoice            = require('../models/Invoice');
const Branch             = require('../models/Branch');
const Notification       = require('../models/Notification');
const AdminNotification  = require('../models/AdminNotification');
const Payroll            = require('../models/Payroll');
const MenuItem           = require('../models/MenuItem');
const ManualItem         = require('../models/ManualItem');
const CabBooking         = require('../models/CabBooking');
const TravelAgency       = require('../models/TravelAgency');
const TravelPackage      = require('../models/TravelPackage');
const Camera             = require('../models/Camera');
const Visitor            = require('../models/Visitor');
const SecurityActivity   = require('../models/SecurityActivity');
const UserSession        = require('../models/UserSession');
const Hall               = require('../models/Hall');
const EventBooking       = require('../models/EventBooking');
const CateringPackage    = require('../models/CateringPackage');
const Complaint          = require('../models/Complaint');
const LaundryOrder       = require('../models/LaundryOrder');
const Registration       = require('../models/Registration');
const AuditLog           = require('../models/AuditLog');
const Document           = require('../models/Document');
const SubscriptionPayment = require('../models/SubscriptionPayment');
const SubscriptionPlan   = require('../models/SubscriptionPlan');
const Role               = require('../models/Role');

const { Employee, Attendance, Housekeeping, Maintenance, POSOrder } = require('../models/Operations');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stayos';

// All models to clear — order doesn't matter for deleteMany
const ALL_MODELS = [
  { name: 'User',               model: User },
  { name: 'Hotel',              model: Hotel },
  { name: 'Room',               model: Room },
  { name: 'Guest',              model: Guest },
  { name: 'Booking',            model: Booking },
  { name: 'Invoice',            model: Invoice },
  { name: 'Branch',             model: Branch },
  { name: 'Notification',       model: Notification },
  { name: 'AdminNotification',  model: AdminNotification },
  { name: 'Payroll',            model: Payroll },
  { name: 'MenuItem',           model: MenuItem },
  { name: 'ManualItem',         model: ManualItem },
  { name: 'CabBooking',         model: CabBooking },
  { name: 'TravelAgency',       model: TravelAgency },
  { name: 'TravelPackage',      model: TravelPackage },
  { name: 'Camera',             model: Camera },
  { name: 'Visitor',            model: Visitor },
  { name: 'SecurityActivity',   model: SecurityActivity },
  { name: 'UserSession',        model: UserSession },
  { name: 'Hall',               model: Hall },
  { name: 'EventBooking',       model: EventBooking },
  { name: 'CateringPackage',    model: CateringPackage },
  { name: 'Complaint',          model: Complaint },
  { name: 'LaundryOrder',       model: LaundryOrder },
  { name: 'Registration',       model: Registration },
  { name: 'AuditLog',           model: AuditLog },
  { name: 'Document',           model: Document },
  { name: 'SubscriptionPayment',model: SubscriptionPayment },
  { name: 'SubscriptionPlan',   model: SubscriptionPlan },
  { name: 'Role',               model: Role },
  { name: 'Employee',           model: Employee },
  { name: 'Attendance',         model: Attendance },
  { name: 'Housekeeping',       model: Housekeeping },
  { name: 'Maintenance',        model: Maintenance },
  { name: 'POSOrder',           model: POSOrder },
];

// ── 1. Backup ──────────────────────────────────────────────────
async function backupAll() {
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

  console.log('\n📦  Creating backup …');
  const backup = {};

  for (const { name, model } of ALL_MODELS) {
    try {
      const docs = await model.find({}).lean();
      backup[name] = docs;
      console.log(`   ✅  ${name}: ${docs.length} documents`);
    } catch (err) {
      console.log(`   ⚠️  ${name}: skipped (${err.message})`);
      backup[name] = [];
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`\n💾  Backup saved → ${backupFile}`);
  return backupFile;
}

// ── 2. Delete everything ───────────────────────────────────────
async function clearAll() {
  console.log('\n🗑️   Clearing all collections …');

  for (const { name, model } of ALL_MODELS) {
    try {
      const result = await model.deleteMany({});
      console.log(`   🧹  ${name}: deleted ${result.deletedCount} documents`);
    } catch (err) {
      console.log(`   ⚠️  ${name}: skip (${err.message})`);
    }
  }

  // Also drop any extra collections that might exist but have no model
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const modelCollections = ALL_MODELS.map(m => m.model.collection.collectionName);

  for (const col of collections) {
    if (!modelCollections.includes(col.name) && col.name !== 'system.version') {
      try {
        await db.dropCollection(col.name);
        console.log(`   🧹  Extra collection "${col.name}": dropped`);
      } catch (err) {
        console.log(`   ⚠️  Extra collection "${col.name}": skip (${err.message})`);
      }
    }
  }

  console.log('\n✅  All data cleared.');
}

// ── 3. Re-create platform admin ────────────────────────────────
async function seedAdmin() {
  console.log('\n👤  Creating platform admin …');

  const admin = await User.create({
    name:     'Platform Admin',
    email:    process.env.PLATFORM_ADMIN_EMAIL || 'admin@stayos.in',
    password: process.env.PLATFORM_ADMIN_PASSWORD || 'password',
    role:     'platform_admin',
    isActive: true,
  });

  console.log(`   ✅  Admin created: ${admin.email}  (role: ${admin.role})`);
  console.log(`   🔑  Password: ${process.env.PLATFORM_ADMIN_PASSWORD || 'password'}`);
}

// ── 4. Verify ──────────────────────────────────────────────────
async function verify() {
  console.log('\n🔍  Verification …');

  for (const { name, model } of ALL_MODELS) {
    const count = await model.countDocuments();
    const expected = name === 'User' ? 1 : 0;
    const icon = count === expected ? '✅' : '❌';
    console.log(`   ${icon}  ${name}: ${count} documents`);
  }
}

// ── Main ───────────────────────────────────────────────────────
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗  Connected to MongoDB');

    await backupAll();
    await clearAll();
    await seedAdmin();
    await verify();

    console.log('\n🎉  Database reset complete! The system is ready for fresh data entry.');
    console.log('    Login with:');
    console.log(`      Email:    ${process.env.PLATFORM_ADMIN_EMAIL || 'admin@stayos.in'}`);
    console.log(`      Password: ${process.env.PLATFORM_ADMIN_PASSWORD || 'password'}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌  Fatal error:', err);
    process.exit(1);
  }
})();
