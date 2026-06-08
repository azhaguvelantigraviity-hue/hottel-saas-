const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./backend/models/User');

const migrateRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Update Receptionists
    const resultRec = await User.updateMany(
      { role: 'hotel_staff', department: { $in: ['Front Desk', 'Front Office'] } },
      { $set: { role: 'receptionist', department: 'Front Desk' } }
    );
    console.log(`Updated ${resultRec.modifiedCount} receptionists.`);

    // Update Housekeeping
    const resultHk = await User.updateMany(
      { role: 'hotel_staff', department: 'Housekeeping' },
      { $set: { role: 'housekeeping' } }
    );
    console.log(`Updated ${resultHk.modifiedCount} housekeepers.`);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateRoles();
