// src/utils/seeder.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Hotel    = require('../models/Hotel');
const Room     = require('../models/Room');
const Guest    = require('../models/Guest');
const Booking  = require('../models/Booking');
const { Employee } = require('../models/Operations');
const logger   = require('./logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stayos';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  logger.info('Seeder connected to MongoDB');

  // Clear existing
  await Promise.all([User, Hotel, Room, Guest, Booking, Employee].map((M) => M.deleteMany()));
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

  logger.info('Seeding completed successfully!');
  mongoose.connection.close();
};

seed().catch((err) => { logger.error(err); process.exit(1); });
