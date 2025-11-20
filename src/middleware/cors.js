const cors = require('cors');
const logger = require('../config/logger');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      'https://admin.glownaturas.com', // Hardcoded fallback for admin panel
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000'
    ].filter(Boolean);
    
    // Allow requests with no origin (same-origin, Postman, or development tools)
    if (!origin) {
      logger.info('CORS: Allowing request with no origin header');
      callback(null, true);
      return;
    }
    
    // Normalize URLs (remove trailing slashes) and check whitelist
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedOrigin = origin.replace(/\/$/, '');
      const normalizedAllowed = allowed?.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed;
    });
    
    if (isAllowed) {
      logger.info('CORS: Allowing origin', { origin });
      callback(null, true);
    } else {
      // Log blocked origin with environment details for debugging
      logger.warn('CORS origin blocked', {
        origin: origin,
        allowedOrigins: allowedOrigins,
        ADMIN_URL_env: process.env.ADMIN_URL,
        FRONTEND_URL_env: process.env.FRONTEND_URL,
        NODE_ENV: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        event: 'cors_violation'
      });
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};

module.exports = cors(corsOptions);

