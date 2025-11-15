require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDatabase = require('./config/database');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const { sanitizeData } = require('./middleware/sanitize');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');
const scheduleExpiredOrdersJob = require('./jobs/expiredOrders');

// Environment Variables Validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'BREVO_SMTP_HOST',
  'BREVO_SMTP_USER',
  'BREVO_SMTP_PASSWORD',
  'FROM_EMAIL',
  'FROM_NAME',
  'ADMIN_URL',
  'FRONTEND_URL',
  'COMPANY_EMAIL_DOMAIN'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('\n--- CRITICAL ERROR: Missing required environment variables:');
  console.error(missingEnvVars.map(v => `  - ${v}`).join('\n'));
  console.error('\nApplication cannot start without these variables. Please check your .env file.\n');
  process.exit(1);
}

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET.length < 32) {
  console.error('\n--- CRITICAL ERROR: JWT_SECRET must be at least 32 characters long for security.');
  console.error('Current length:', process.env.JWT_SECRET.length);
  process.exit(1);
}

logger.info('Environment variables validated successfully');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const mediaRoutes = require('./routes/media');
const reviewsRoutes = require('./routes/reviews');
const ordersRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const cartRoutes = require('./routes/cart');
const emailTemplatesRoutes = require('./routes/emailTemplates');

const app = express();

connectDatabase();

scheduleExpiredOrdersJob();

// Enhanced Helmet configuration for production security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));
app.use(corsMiddleware);
app.use(sanitizeData);
app.use(generalLimiter);

// Add unique request ID for tracking
app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim(), { requestId: 'http' })
  }
}));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GlowNaturas API - Complete E-Commerce with Full Authentication System',
    version: '5.0.0',
    features: [
      'Complete Admin Authentication (Email Verification, Password Reset)',
      'Self-Registration with Company Email',
      'Email Verification System',
      'Password Reset & Recovery',
      'Shopping Cart System',
      'Stock Reservation (Reserve on Order, Deduct on Payment)',
      'PDF Receipt Generation',
      'Order Expiry Automation (6 hours)',
      'Rate Limiting (Security)',
      'Input Sanitization (XSS & NoSQL Injection Prevention)',
      'Professional Logging System',
      'Admin Audit Trail',
      'Dynamic Email Template Management',
      'Complete Media Library',
      'Advanced Order Management (Refunds, Notes, Export)',
      'Multi-Delivery Method Support (Courier, Local, Pickup)',
      'Professional Email Templates (No Emojis)'
    ],
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      media: '/api/media',
      reviews: '/api/reviews',
      orders: '/api/orders',
      cart: '/api/cart',
      dashboard: '/api/dashboard',
      settings: '/api/settings',
      emailTemplates: '/api/email-templates'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/email-templates', emailTemplatesRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`GlowNaturas API v5.0 started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n========================================');
  console.log(`GlowNaturas API v5.0 - Complete Auth System`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('========================================\n');
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
