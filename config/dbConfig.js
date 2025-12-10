const mongoose = require("mongoose");
 
const connectDataBase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to the database successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
module.exports = connectDataBase;
 
 