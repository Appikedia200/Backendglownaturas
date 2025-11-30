const cors = require('cors');
const logger = require('../config/logger');

const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173', // Vite default
  
  // Production - Frontend
  'https://glownaturas.com',
  'https://www.glownaturas.com',
  'https://glownatura.pages.dev',
  
  // Production - Admin Panel
  'https://admin.glownaturas.com',
  'https://www.admin.glownaturas.com',
  'https://glownatura-admin.pages.dev',
  'https://admin-panel-psi-two-49.vercel.app',
  
  // Environment variables
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      logger.info('CORS: Allowed origin', { origin });
      return callback(null, true);
    }
    
    // Check Cloudflare preview URLs (pattern: *.glownatura.pages.dev)
    if (/^https:\/\/[a-z0-9-]+\.glownatura\.pages\.dev$/.test(origin)) {
      logger.info('CORS: Allowed Cloudflare preview', { origin });
      return callback(null, true);
    }
    
    // Check Vercel preview URLs (pattern: *.vercel.app)
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) {
      logger.info('CORS: Allowed Vercel preview', { origin });
      return callback(null, true);
    }
    
    logger.warn('CORS: Blocked origin', { origin });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Total-Pages',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Authorization',
    'X-Request-ID'
  ],
  maxAge: 86400, // 24 hours - cache preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);
