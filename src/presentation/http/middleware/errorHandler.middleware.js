const { AppError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const Response = require('../../../shared/utils/Response');

/**
 * Centralized Error Handler Middleware
 * Converts all errors to consistent API response format
 * @version 5.1.0
 */
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    method: req.method,
    path: req.path,
    body: req.body,
  });

  // Handle operational errors (known errors from our AppError classes)
  if (err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    
    return res.status(400).json(Response.error(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      errors
    ));
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(Response.error(
      `Invalid ${err.path}: ${err.value}`,
      'INVALID_ID',
      400
    ));
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json(Response.error(
      `Duplicate value for ${field}`,
      'DUPLICATE_ERROR',
      409
    ));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(Response.error(
      'Invalid token',
      'INVALID_TOKEN',
      401
    ));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(Response.error(
      'Token expired',
      'TOKEN_EXPIRED',
      401
    ));
  }

  // Handle payload too large error
  if (err.type === 'entity.too.large') {
    return res.status(413).json(Response.error(
      'Request payload too large',
      'PAYLOAD_TOO_LARGE',
      413
    ));
  }

  // Programming or unknown errors - don't leak to client
  return res.status(500).json(Response.error(
    process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    'INTERNAL_ERROR',
    500
  ));
}

module.exports = errorHandler;

