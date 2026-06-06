const mongoose = require('mongoose');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(async () => {
    console.log('Connected to DB');
    const users = await User.find();
    console.log('Users:', users.map(u => ({ email: u.email, role: u.role, hotel: u.hotel })));
    
    const hotels = await Hotel.find();
    console.log('Hotels:', hotels.map(h => ({ _id: h._id, name: h.name, plan: h.plan })));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
