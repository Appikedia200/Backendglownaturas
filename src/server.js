/**
 * Server Entry Point
 * Clean Architecture - Starts Express server and handles graceful shutdown
 * @version 5.1.0
 */

require('dotenv').config();

// Create logs directory if it doesn't exist (required for Render deployment)
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const mongoose = require('mongoose');
const app = require('./app');
const connectDatabase = require('./config/database');
const logger = require('./config/logger');
const scheduleExpiredOrdersJob = require('./jobs/expiredOrders');
const Config = require('./infrastructure/config');

const PORT = process.env.PORT || 5000;

// Validate configuration early to fail fast on missing env variables
Config.validate();

// Connect to database
connectDatabase();

// Schedule background jobs
scheduleExpiredOrdersJob();

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`, {
    environment: process.env.NODE_ENV,
    port: PORT,
    architecture: 'Clean Architecture v5.1.0'
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Close database connection
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      
      // Exit process
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, {
    stack: err.stack,
    name: err.name
  });
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, {
    stack: err.stack,
    name: err.name
  });
  gracefulShutdown('uncaughtException');
});

module.exports = server;
