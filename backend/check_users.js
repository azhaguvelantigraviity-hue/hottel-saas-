require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require("./models/User");
  const users = await User.find({ role: { $ne: "platform_admin" }, hotel: null }, "email role");
  console.log("Users without hotel:", users);
  process.exit();
});
