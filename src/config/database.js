const mongoose = require('mongoose');
const logger = require('./logger');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`, {
        error: err.stack
      });
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
  } catch (error) {
    // Don't expose MongoDB connection string in error messages
    logger.error('Database connection failed. Check MONGODB_URI environment variable.');
    
    // Log detailed error securely (won't expose connection string)
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error details', { message: error.message });
    }
    
    process.exit(1);
  }
};

module.exports = connectDatabase;

