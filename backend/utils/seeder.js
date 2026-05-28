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

  logger.info('Seeding is disabled — no mock data to insert.');

  mongoose.connection.close();
};

seed().catch((err) => { logger.error(err); process.exit(1); });
