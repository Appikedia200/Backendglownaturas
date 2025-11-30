const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Helper to create rate limiters
const createLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((options.windowMs || 900000) / 1000 / 60) + ' minutes'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json(options.message);
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    },
    // Use standard IP-based key generation (IPv6-safe)
    validate: { trustProxy: false }
  });
};

// Different limiters for different use cases
const limiters = {
  // General API - generous limit
  general: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: 'Too many requests. Please slow down and try again in a few minutes.'
  }),

  // Auth endpoints - stricter to prevent brute force
  auth: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.'
  }),

  // Admin operations - moderate limit (increased for heavy admin usage)
  admin: createLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // 120 requests per minute (2 per second)
    message: 'Admin rate limit reached. Please wait a moment before continuing.'
  }),

  // Public read operations - very generous
  publicRead: createLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300,
    message: 'Request limit reached. Please try again shortly.'
  }),

  // Order creation - prevent spam
  orders: createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Order limit reached. You can only place 20 orders per hour.'
  }),

  // Media uploads - prevent abuse
  uploads: createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: 'Upload limit reached. Please wait before uploading more files.'
  })
};

// Export both old format (for backwards compatibility) and new format
module.exports = limiters;

// Also export individual limiters for backwards compatibility
exports.generalLimiter = limiters.general;
exports.authLimiter = limiters.auth;
exports.orderLimiter = limiters.orders;
exports.reviewLimiter = limiters.publicRead;

