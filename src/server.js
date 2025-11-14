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

app.use(helmet());
app.use(corsMiddleware);
app.use(sanitizeData);
app.use(generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
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
