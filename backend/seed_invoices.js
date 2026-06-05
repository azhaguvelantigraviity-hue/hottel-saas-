require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const Invoice = require('./models/Invoice');
const Guest = require('./models/Guest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stayos';

const seedInvoices = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const hotel = await Hotel.findOne({ name: 'The Grand Resort' });
  if (!hotel) {
    console.log('Hotel not found!');
    process.exit(1);
  }

  // Clear existing invoices
  await Invoice.deleteMany({ hotel: hotel._id });

  // Let's create some guests if they don't exist
  let guest1 = await Guest.findOne({ firstName: 'Alice', hotel: hotel._id });
  if (!guest1) guest1 = await Guest.create({ hotel: hotel._id, firstName: 'Alice', lastName: 'Smith', phone: '9999999991', email: 'alice@example.com' });

  let guest2 = await Guest.findOne({ firstName: 'Bob', hotel: hotel._id });
  if (!guest2) guest2 = await Guest.create({ hotel: hotel._id, firstName: 'Bob', lastName: 'Johnson', phone: '9999999992', email: 'bob@example.com' });

  let guest3 = await Guest.findOne({ firstName: 'Charlie', hotel: hotel._id });
  if (!guest3) guest3 = await Guest.create({ hotel: hotel._id, firstName: 'Charlie', lastName: 'Brown', phone: '9999999993', email: 'charlie@example.com' });

  let guest4 = await Guest.findOne({ firstName: 'Diana', hotel: hotel._id });
  if (!guest4) guest4 = await Guest.create({ hotel: hotel._id, firstName: 'Diana', lastName: 'Prince', phone: '9999999994', email: 'diana@example.com' });

  let guest5 = await Guest.findOne({ firstName: 'Ethan', hotel: hotel._id });
  if (!guest5) guest5 = await Guest.create({ hotel: hotel._id, firstName: 'Ethan', lastName: 'Hunt', phone: '9999999995', email: 'ethan@example.com' });

  const guests = [guest1, guest2, guest3, guest4, guest5];

  const types = ['room', 'pos', 'event', 'other'];
  const statuses = ['issued', 'paid', 'paid', 'paid', 'cancelled', 'refunded', 'partial'];

  const invoices = [];

  const today = new Date();
  
  // Generate 25 invoices scattered over the last 60 days
  for (let i = 0; i < 25; i++) {
    const guest = guests[Math.floor(Math.random() * guests.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Pick a random date within the last 60 days
    const randomDaysAgo = Math.floor(Math.random() * 60);
    const date = new Date(today.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);

    const subtotal = Math.floor(Math.random() * 15000) + 2000;
    const taxRate = 18;
    const taxAmount = Math.round(subtotal * (taxRate / 100));
    const totalAmount = subtotal + taxAmount;
    
    // Determine payment status randomly
    const statusIdx = Math.floor(Math.random() * statuses.length);
    let paymentStatus = statuses[statusIdx];
    if (paymentStatus === 'issued') paymentStatus = 'pending';

    let paidAmount = 0;
    if (paymentStatus === 'paid') paidAmount = totalAmount;
    else if (paymentStatus === 'partial') paidAmount = Math.floor(totalAmount * 0.5);
    else if (paymentStatus === 'refunded') paidAmount = 0; // or they paid then refunded
    
    let dueAmount = totalAmount - paidAmount;
    if (paymentStatus === 'cancelled' || paymentStatus === 'refunded') dueAmount = 0;

    let dbStatus = paymentStatus === 'pending' || paymentStatus === 'partial' ? 'issued' : paymentStatus;
    if (paymentStatus === 'refunded') dbStatus = 'refunded';

    await Invoice.create({
      hotel: hotel._id,
      type: type,
      guest: guest._id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      guestEmail: guest.email,
      guestPhone: guest.phone,
      roomNumber: type === 'room' ? `10${Math.floor(Math.random()*9)+1}` : undefined,
      subtotal: subtotal,
      roomCharges: type === 'room' ? subtotal : 0,
      foodCharges: type === 'pos' ? subtotal : 0,
      taxRate: taxRate,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      paymentStatus: paymentStatus,
      status: dbStatus,
      createdAt: date,
      updatedAt: date
    });
  }

  console.log(`Seeded 25 mock invoices successfully.`);
  process.exit(0);
};

seedInvoices().catch(err => {
  console.error(err);
  process.exit(1);
});
