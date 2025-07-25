const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User'); 

dotenv.config({ path: '../.env' })


// MongoDB URI from .env
const DB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI); 
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('✅ Admin already exists:', adminExists.email);
    } else {
      const admin = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        passwordConfirm: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        status: 'active',
      });

      console.log('🆕 Admin user created:', admin.email);
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();
