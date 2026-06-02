const mongoose = require('mongoose');
const { Booking } = require('./models/Booking'); // Actually Booking.js exports Booking directly
const BookingModel = require('./models/Booking');
const Hotel = require('./models/Hotel');
require('dotenv').config();

async function testBooking() {
  await mongoose.connect(process.env.MONGO_URI);
  const hotel = await Hotel.findOne();
  if (!hotel) {
    console.log("No hotel found");
    return process.exit();
  }
  
  const body = {
    hotel: hotel._id,
    bookingId: 'BK-123',
    guest: new mongoose.Types.ObjectId(), // mock
    room: new mongoose.Types.ObjectId(), // mock
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000),
    totalAmount: 5000
  };

  try {
    const b = await BookingModel.create(body);
    console.log("Booking created successfully:", b._id);
  } catch (err) {
    console.error("Validation Error:", err.message);
  }
  process.exit();
}
testBooking();
