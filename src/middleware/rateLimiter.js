const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// General API rate limiter (100 requests per 15 minutes)
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - General', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      limiterType: 'general'
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      errorCode: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(15 * 60) // seconds
    });
  }
});

// Authentication rate limiter (5 requests per 15 minutes)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful auth attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Authentication', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      limiterType: 'auth'
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later.',
      errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(15 * 60) // seconds
    });
  }
});

// Order creation rate limiter (10 requests per hour)
exports.orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Order Creation', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      limiterType: 'order'
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many orders from this IP, please try again later.',
      errorCode: 'ORDER_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(60 * 60) // seconds
    });
  }
});

// Review submission rate limiter (5 requests per hour)
exports.reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Review Submission', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      limiterType: 'review'
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many reviews submitted, please try again later.',
      errorCode: 'REVIEW_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(60 * 60) // seconds
    });
  }
});

