// backend/utils/addAdmin.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stayos';

const seedAdmin = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const adminEmail = 'admin@stayos.com';
  
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
      console.log('Admin already exists with email:', adminEmail);
      // Optional: Update password to ensure it is 'password'
      existingAdmin.password = 'password';
      await existingAdmin.save();
      console.log('Admin password updated to "password"');
  } else {
      await User.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: 'password',
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
