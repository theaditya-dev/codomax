/**
 * db.js
 * ------------------------------------------------------------------
 * MODULE 3: Connects the backend to MongoDB Atlas using Mongoose.
 *
 * The connection string lives in the .env file (MONGO_URI) and is
 * NEVER hard-coded here — see backend/.env.example for the format.
 *
 * connectDB() is called once from server.js when the app starts.
 * If the connection fails, we log a clear error and exit the process,
 * since the API cannot safely serve requests without a database.
 * ------------------------------------------------------------------
 */

const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ MONGO_URI is not set. Add it to backend/.env (see .env.example).');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
