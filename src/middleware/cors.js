const cors = require('cors');
const logger = require('../config/logger');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      'https://admin.glownaturas.com',
      'https://www.admin.glownaturas.com',
      'https://glownaturas.com',
      'https://www.glownaturas.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite default
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ].filter(Boolean);

    // Normalize and check
    const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => 
      allowed && normalizedOrigin === allowed.toLowerCase().replace(/\/$/, '')
    );

    if (isAllowed) {
      logger.info('CORS: Allowed origin', { origin });
      callback(null, true);
    } else {
      logger.warn('CORS: Blocked origin', { origin, allowedOrigins });
      // Still allow it temporarily for debugging
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization', 'X-Request-ID'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  preflightContinue: false
};

module.exports = cors(corsOptions);
