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
  // General API - VERY GENEROUS (professional e-commerce site needs this!)
  general: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // ✅ 5000 requests per 15 minutes (professional standard)
    message: 'Too many requests. Please slow down and try again in a few minutes.'
  }),

  // Auth endpoints - stricter to prevent brute force
  auth: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // ✅ Increased from 20 to 50 (reasonable for legitimate users)
    message: 'Too many login attempts. Please wait 15 minutes before trying again.'
  }),

  // Admin operations - VERY GENEROUS (admin needs to work fast!)
  admin: createLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 500, // ✅ 500 requests per minute (admin panel makes many API calls)
    message: 'Admin rate limit reached. Please wait a moment before continuing.'
  }),

  // Public read operations - EXTREMELY GENEROUS (this is what frontend uses!)
  publicRead: createLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 2000, // ✅ 2000 requests per minute (homepage loads many resources)
    message: 'Request limit reached. Please try again shortly.'
  }),

  // Order creation - prevent spam
  orders: createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // ✅ Increased from 20 to 50 (legitimate customers may retry)
    message: 'Order limit reached. You can only place 50 orders per hour.'
  }),

  // Media uploads - prevent abuse
  uploads: createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // ✅ Increased from 100 to 200 (admin may upload many images)
    message: 'Upload limit reached. Please wait before uploading more files.'
  })
};

// Export limiters object as default
module.exports = limiters;

// IMPORTANT: Also export individual limiters for backwards compatibility
// Must do this AFTER module.exports to work correctly
module.exports.generalLimiter = limiters.general;
module.exports.authLimiter = limiters.auth;
module.exports.orderLimiter = limiters.orders;
module.exports.reviewLimiter = limiters.publicRead;

