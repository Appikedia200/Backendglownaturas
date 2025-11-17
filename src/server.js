require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
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
  'BREVO_API_KEY',
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

// Request body size limits to prevent DoS attacks
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for signature verification if needed later
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Error handler for payload too large
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload too large. Maximum size is 10MB.',
      errorCode: 'PAYLOAD_TOO_LARGE'
    });
  }
  next(err);
});

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim(), { requestId: 'http' })
  }
}));

// Health check endpoint (no authentication required)
// Used by monitoring tools and load balancers
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const isHealthy = mongoStatus === 1;
  
  const healthData = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '5.1.0',
    environment: process.env.NODE_ENV || 'development',
    dependencies: {
      mongodb: {
        status: mongoStatusMap[mongoStatus],
        connected: isHealthy
      }
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  };
  
  res.status(isHealthy ? 200 : 503).json(healthData);
});

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

const server = app.listen(PORT, () => {
  logger.info(`GlowNaturas API v5.1.0 started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n========================================');
  console.log(`GlowNaturas API v5.1.0 - Security Enhanced`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log('========================================\n');
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed, no longer accepting connections');
    
    try {
      // Close database connection
      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed');
      
      logger.info('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error(`Error during shutdown: ${error.message}`, { stack: error.stack });
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout (30s exceeded)');
    process.exit(1);
  }, 30000);
};

// Register signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections with graceful shutdown
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions with graceful shutdown
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  gracefulShutdown('uncaughtException');
});
