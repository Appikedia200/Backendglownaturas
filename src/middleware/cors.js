const cors = require('cors');
const logger = require('../config/logger');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean); // Remove undefined values
    
    // In development, allow requests with no origin (Postman, etc.)
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment && !origin) {
      callback(null, true);
      return;
    }
    
    // In production, origin must be in whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // SECURITY: Log blocked origin for monitoring without exposing configuration
      logger.warn('CORS origin blocked', {
        origin: origin || 'no-origin',
        timestamp: new Date().toISOString(),
        event: 'cors_violation'
      });
      
      // Return false to block silently (prevents information disclosure)
      // DO NOT throw error as it exposes internal configuration
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);

