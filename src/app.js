/**
 * Express Application Configuration
 * Clean Architecture - Presentation Layer Entry Point
 * @version 5.1.0
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

// Configuration
const Config = require('./infrastructure/config');

// Middleware
const corsMiddleware = require('./middleware/cors');
const { sanitizeData } = require('./middleware/sanitize');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./presentation/http/middleware/errorHandler.middleware');

// Routes - Clean Architecture
const productsRoutes = require('./presentation/http/routes/products.routes');
const ordersRoutes = require('./presentation/http/routes/orders.routes');
const categoriesRoutes = require('./presentation/http/routes/categories.routes');
const reviewsRoutes = require('./presentation/http/routes/reviews.routes');

// Legacy routes (keep until fully migrated)
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const cartRoutes = require('./routes/cart');
const emailTemplatesRoutes = require('./routes/emailTemplates');

// Logger
const logger = require('./config/logger');

// Note: Config validation happens lazily when services are first accessed
// This allows dotenv to load before validation occurs

const app = express();

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
    maxAge: 31536000,
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

// CORS
app.use(corsMiddleware);

// Sanitize data
app.use(sanitizeData);

// Rate limiting
app.use(generalLimiter);

// Add unique request ID for tracking
app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Request body size limits to prevent DoS attacks
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handler for payload too large
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    logger.warn('Payload too large', {
      requestId: req.id,
      path: req.path,
      method: req.method
    });
    return res.status(413).json({
      success: false,
      error: 'Payload too large. Maximum size is 10MB.',
      errorCode: 'PAYLOAD_TOO_LARGE'
    });
  }
  next(err);
});

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '5.1.0',
    }
  });
});

// API Routes - Clean Architecture (NEW)
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/reviews', reviewsRoutes);

// API Routes - Legacy (keep until fully migrated)
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/email-templates', emailTemplatesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      statusCode: 404,
      path: req.path
    }
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;

