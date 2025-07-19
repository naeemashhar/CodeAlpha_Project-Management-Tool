const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected To DB Successfully !"))
};

module.exports = connectDB;
