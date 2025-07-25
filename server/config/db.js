const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

// Recommended for Mongoose v7+ if you're using flexible queries
mongoose.set('strictQuery', false);

const DB = process.env.NODE_ENV === 'test' 
  ? process.env.MONGODB_URI_TEST 
  : process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// Optional: Listen to connection events for logging
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('🚨 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
});

// Graceful shutdown on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 Mongoose connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
