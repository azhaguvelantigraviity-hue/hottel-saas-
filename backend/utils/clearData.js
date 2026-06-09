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

const clearData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    // Clear existing
    await Promise.all([User, Hotel, Room, Guest, Booking, Employee, Invoice].map((M) => M.deleteMany()));
    logger.info('Cleared existing data (Users, Hotels, Rooms, Guests, Bookings, Employees, Invoices)');

    // Create platform admin so the system is still accessible
    const platformAdmin = await User.create({
      name: 'Platform Admin',
      email: process.env.PLATFORM_ADMIN_EMAIL || 'admin@stayos.in',
      password: process.env.PLATFORM_ADMIN_PASSWORD || 'password',
      role: 'platform_admin',
      isActive: true,
    });
    logger.info(`Platform admin recreated: ${platformAdmin.email}`);

    logger.info('Clearing completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearData();
