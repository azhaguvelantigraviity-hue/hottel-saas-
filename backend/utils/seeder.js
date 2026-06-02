// src/utils/seeder.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Hotel    = require('../models/Hotel');
const Room     = require('../models/Room');
const Guest    = require('../models/Guest');
const Booking  = require('../models/Booking');
const Invoice  = require('../models/Invoice');
const { Employee } = require('../models/Operations');
const logger   = require('./logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stayos';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  logger.info('Seeder connected to MongoDB');

  // Clear existing
  await Promise.all([User, Hotel, Room, Guest, Booking, Employee, Invoice].map((M) => M.deleteMany()));
  logger.info('Cleared existing data');

  // Create platform admin
  const platformAdmin = await User.create({
    name: 'Platform Admin',
    email: process.env.PLATFORM_ADMIN_EMAIL || 'admin@stayos.com',
    password: process.env.PLATFORM_ADMIN_PASSWORD || 'password',
    role: 'platform_admin',
    isActive: true,
  });
  logger.info(`Platform admin created: ${platformAdmin.email}`);

  // Create a demo hotel
  const demoHotel = await Hotel.create({
    name: 'The Grand Resort',
    address: {
      street: '123 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
    },
    phone: '+91 9876543210',
    email: 'contact@grandresort.com',
    plan: 'enterprise',
    planStatus: 'active',
    subscriptionStart: new Date(),
    nextPaymentAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  });
  logger.info(`Demo hotel created: ${demoHotel.name}`);

  // Create hotel manager
  const hotelManager = await User.create({
    name: 'Hotel Manager',
    email: 'manager@hotel.com',
    password: 'password',
    role: 'hotel_admin',
    hotel: demoHotel._id,
    isActive: true,
  });
  logger.info(`Hotel manager created: ${hotelManager.email}`);

  // Create receptionist
  const receptionist = await User.create({
    name: 'John Doe',
    email: 'recep@hotel.com',
    password: 'password',
    role: 'hotel_staff',
    hotel: demoHotel._id,
    isActive: true,
  });
  logger.info(`Receptionist created: ${receptionist.email}`);

  logger.info(`Receptionist created: ${receptionist.email}`);

  // Create sample rooms
  const rooms = await Room.insertMany([
    { hotel: demoHotel._id, roomNumber: '101', type: 'Standard Twin', baseRate: 2000, status: 'available' },
    { hotel: demoHotel._id, roomNumber: '102', type: 'Deluxe King', baseRate: 3500, status: 'occupied' },
    { hotel: demoHotel._id, roomNumber: '103', type: 'Suite', baseRate: 6000, status: 'reserved' },
    { hotel: demoHotel._id, roomNumber: '104', type: 'Deluxe Queen', baseRate: 3000, status: 'maintenance', maintenanceIssue: 'AC not cooling', expectedCompletion: new Date(Date.now() + 86400000) },
    { hotel: demoHotel._id, roomNumber: '105', type: 'Presidential Suite', baseRate: 15000, status: 'available', housekeepingStatus: 'dirty' },
  ]);
  logger.info(`Sample rooms created`);

  // Create sample guests
  const guest1 = await Guest.create({ hotel: demoHotel._id, firstName: 'Alice', lastName: 'Smith', phone: '9999999991', email: 'alice@example.com' });
  const guest2 = await Guest.create({ hotel: demoHotel._id, firstName: 'Bob', lastName: 'Johnson', phone: '9999999992', email: 'bob@example.com' });

  // Create sample bookings
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const bk1 = await Booking.create({
    hotel: demoHotel._id, room: rooms[1]._id, guest: guest1._id,
    checkIn: today, checkOut: tomorrow, nights: 1, roomRate: 3500, totalAmount: 4130, paidAmount: 4130, status: 'checked_in', paymentStatus: 'paid'
  });

  const bk2 = await Booking.create({
    hotel: demoHotel._id, room: rooms[2]._id, guest: guest2._id,
    checkIn: yesterday, checkOut: today, nights: 1, roomRate: 6000, totalAmount: 7080, paidAmount: 0, status: 'confirmed', paymentStatus: 'pending'
  });
  logger.info(`Sample bookings created`);

  // Create sample invoices
  await Invoice.create({
    hotel: demoHotel._id, type: 'room', guest: guest1._id, booking: bk1._id, guestName: 'Alice Smith',
    roomNumber: '102', checkIn: today, checkOut: tomorrow, nights: 1,
    subtotal: 3500, taxAmount: 630, totalAmount: 4130, paidAmount: 4130, dueAmount: 0,
    status: 'issued', paymentStatus: 'paid'
  });

  await Invoice.create({
    hotel: demoHotel._id, type: 'room', guest: guest2._id, booking: bk2._id, guestName: 'Bob Johnson',
    roomNumber: '103', checkIn: yesterday, checkOut: today, nights: 1,
    subtotal: 6000, taxAmount: 1080, totalAmount: 7080, paidAmount: 0, dueAmount: 7080,
    status: 'issued', paymentStatus: 'pending'
  });
  logger.info(`Sample invoices created`);

  logger.info('Seeding completed successfully!');
  mongoose.connection.close();
};

seed().catch((err) => { logger.error(err); process.exit(1); });
