const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    // Don't expose MongoDB connection string in error messages
    console.error('--- Database connection failed. Check MONGODB_URI environment variable.');
    
    // Log detailed error securely (won't expose connection string)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error.message);
    }
    
    process.exit(1);
  }
};

module.exports = connectDatabase;

