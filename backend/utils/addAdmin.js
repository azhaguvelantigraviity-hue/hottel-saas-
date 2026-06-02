// backend/utils/addAdmin.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stayos';

const seedAdmin = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL || 'admin@stayos.com';
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || 'password';
  
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
      console.log('Admin already exists with email:', adminEmail);
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('Admin password updated to match .env');
  } else {
      await User.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'platform_admin',
        isActive: true,
      });
      console.log(`Platform admin created: ${adminEmail}`);
  }

  mongoose.connection.close();
};

seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
