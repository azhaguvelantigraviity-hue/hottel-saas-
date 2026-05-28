// src/utils/seeder.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
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

  // ── Platform Admin ────────────────────────────────────────────────────────
  const adminUser = await User.create({
    name:     'StayOS Admin',
    email:    process.env.PLATFORM_ADMIN_EMAIL || 'admin@stayos.in',
    password: process.env.PLATFORM_ADMIN_PASSWORD || 'Admin@StayOS2025!',
    role:     'platform_admin',
  });
  logger.info(`Platform admin: ${adminUser.email}`);

  // ── Hotels ────────────────────────────────────────────────────────────────
  const hotelDefs = [];

  for (const def of hotelDefs) {
    const hotel = await Hotel.create({
      name:         def.name,
      email:        def.email,
      plan:         def.plan,
      planStatus:   'active',
      totalRooms:   def.rooms,
      address:      { city: def.city, country: 'India' },
      subscriptionStart: new Date(),
      nextPaymentAt: new Date(Date.now() + 30 * 86400000),
    });

    // Hotel admin user
    const hotelAdmin = await User.create({
      name:     `Admin – ${def.name}`,
      email:    def.email,
      password: 'Hotel@123!',
      role:     'hotel_admin',
      hotel:    hotel._id,
    });

    hotel.owner = hotelAdmin._id;
    await hotel.save();

    // Seed rooms
    const roomTypes = ['Standard Twin', 'Deluxe King', 'Deluxe Queen', 'Suite'];
    const roomCount = Math.min(def.rooms, 12);
    const rooms = [];
    for (let i = 1; i <= roomCount; i++) {
      const floor = Math.ceil(i / 4);
      const type  = roomTypes[(i - 1) % roomTypes.length];
      const rateMap = { 'Standard Twin': 2800, 'Deluxe King': 4200, 'Deluxe Queen': 3600, Suite: 8500 };
      const r = await Room.create({
        hotel:      hotel._id,
        roomNumber: `${floor}0${i % 4 === 0 ? 4 : i % 4}`,
        floor,
        type,
        status:     i % 3 === 0 ? 'occupied' : i % 5 === 0 ? 'reserved' : 'available',
        baseRate:   rateMap[type],
        maxAdults:  type === 'Suite' ? 3 : 2,
        housekeepingStatus: i % 4 === 0 ? 'dirty' : 'clean',
      });
      rooms.push(r);
    }

    // Seed guests & bookings for non-starter
    if (def.plan !== 'starter') {
      const guestNames = [
        { first: 'Arjun',  last: 'Mehta',  email: 'arjun.m@email.com' },
        { first: 'Priya',  last: 'Sharma', email: 'priya.s@email.com' },
        { first: 'Rohit',  last: 'Verma',  email: 'rohit.v@email.com' },
        { first: 'Kavya',  last: 'Nair',   email: 'kavya.n@email.com' },
      ];

      for (let i = 0; i < guestNames.length; i++) {
        const gd = guestNames[i];
        const guest = await Guest.create({
          hotel:      hotel._id,
          firstName:  gd.first,
          lastName:   gd.last,
          email:      gd.email,
          phone:      `+91 9876${String(i).padStart(6,'0')}`,
          nationality:'Indian',
          source:     'Direct',
          totalStays: i + 1,
          totalSpent: (i + 1) * 8000,
          loyaltyPoints: (i + 1) * 80,
          loyaltyTier: i === 3 ? 'Silver' : 'Bronze',
        });

        const occRoom = rooms.find((r) => r.status === 'occupied');
        if (occRoom) {
          await Booking.create({
            hotel:         hotel._id,
            room:          occRoom._id,
            guest:         guest._id,
            createdBy:     hotelAdmin._id,
            checkIn:       new Date(),
            checkOut:      new Date(Date.now() + 4 * 86400000),
            nights:        4,
            adults:        2,
            roomRate:      occRoom.baseRate,
            taxRate:       18,
            taxAmount:     occRoom.baseRate * 4 * 0.18,
            totalAmount:   occRoom.baseRate * 4 * 1.18,
            status:        'checked_in',
            paymentStatus: 'paid',
            source:        'Direct',
          });
        }
      }

      // Employees for professional/enterprise
      const empDepts = [
        { name: 'Rajesh Kumar',   dept: 'Front Office',  role: 'Receptionist',  salary: 28000 },
        { name: 'Anita Patel',    dept: 'Housekeeping',  role: 'Supervisor',    salary: 32000 },
        { name: 'Suresh Nair',    dept: 'F&B',           role: 'Chef',          salary: 45000 },
        { name: 'Meena Joshi',    dept: 'Security',      role: 'Guard',         salary: 22000 },
      ];
      for (const e of empDepts) {
        await Employee.create({
          hotel:      hotel._id,
          name:       e.name,
          department: e.dept,
          role:       e.role,
          shift:      'Morning',
          salary:     e.salary,
          status:     'active',
          email:      `${e.name.split(' ')[0].toLowerCase()}@${def.email.split('@')[1]}`,
        });
      }
    }

    logger.info(`Seeded: ${def.name} (${def.plan}) – ${roomCount} rooms`);
  }

  logger.info('\n✅ Seeding complete!');
  logger.info('─────────────────────────────────────');
  logger.info(`Platform Admin:  admin@stayos.in  /  Admin@StayOS2025!`);
  logger.info(`Hotel Admin:     info@hilltopinn.com  /  Hotel@123!  (Starter)`);
  logger.info(`Hotel Admin:     ops@azuregoa.com     /  Hotel@123!  (Professional)`);
  logger.info(`Hotel Admin:     gm@grandmeridian.com /  Hotel@123!  (Enterprise)`);
  logger.info('─────────────────────────────────────');

  mongoose.connection.close();
};

seed().catch((err) => { logger.error(err); process.exit(1); });
