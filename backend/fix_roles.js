const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  await User.updateMany({ email: { $ne: 'admin@stayos.in' } }, { role: 'hotel_admin' });
  console.log('Reverted other users to hotel_admin');
  process.exit();
}).catch(console.error);
