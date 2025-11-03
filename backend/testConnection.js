require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('========================================');
    console.log('Testing MongoDB Connection...');
    console.log('========================================');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    console.log('');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✓ MongoDB connected successfully!');
    console.log('✓ Database:', mongoose.connection.name);
    console.log('✓ Host:', mongoose.connection.host);
    console.log('✓ Port:', mongoose.connection.port);
    console.log('');
    console.log('========================================');
    console.log('Connection test PASSED!');
    console.log('========================================');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('========================================');
    console.error('✗ MongoDB connection FAILED!');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure MongoDB is running: mongod');
    console.error('2. Check MongoDB Compass is open');
    console.error('3. Verify MONGODB_URI in .env file');
    console.error('========================================');
    process.exit(1);
  }
};

testConnection();
