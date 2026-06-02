// backend/utils/wipeData.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const { Employee } = require('../models/Operations');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stayos';

const wipeData = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User, Hotel, Room, Guest, Booking, Employee, Invoice].map((M) => M.deleteMany()));
  console.log('All collections wiped successfully.');

  mongoose.connection.close();
};

wipeData().catch((err) => {
    console.error(err);
    process.exit(1);
});
