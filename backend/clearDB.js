require('dotenv').config();
const mongoose = require('mongoose');

const Booking = require('./models/Booking');
const CabBooking = require('./models/CabBooking');
const EventBooking = require('./models/EventBooking');
const Guest = require('./models/Guest');
const Invoice = require('./models/Invoice');
const LaundryOrder = require('./models/LaundryOrder');
const Room = require('./models/Room');
const Visitor = require('./models/Visitor');
const UserSession = require('./models/UserSession');

async function clearData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    console.log('Deleting all transactional data (Bookings, Guests, Rooms, etc.)...');
    
    // Clear collections
    await Booking.deleteMany({});
    await CabBooking.deleteMany({});
    await EventBooking.deleteMany({});
    await Guest.deleteMany({});
    await Invoice.deleteMany({});
    await LaundryOrder.deleteMany({});
    await Room.deleteMany({});
    await Visitor.deleteMany({});
    await UserSession.deleteMany({});

    console.log('All transactional data has been successfully cleared from the database.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
}

clearData();
