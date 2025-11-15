const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Helper function for rate limit logging
const onLimitReached = (req, res, options) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    userAgent: req.get('user-agent')
  });
};

exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached
});

exports.orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many orders from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached
});

exports.reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many reviews submitted, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached
});

