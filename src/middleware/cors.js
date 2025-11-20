const cors = require('cors');
const logger = require('../config/logger');

// Simple, working CORS configuration
const corsOptions = {
  origin: true, // Allow ALL origins temporarily to test
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization', 'X-Request-ID'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  preflightContinue: false
};

module.exports = cors(corsOptions);
