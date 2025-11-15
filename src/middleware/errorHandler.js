const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Log error with context for debugging
  logger.error('Application error', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.id
  });
  
  let error = { ...err };
  error.message = err.message;
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    error.statusCode = 400;
  }
  
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(e => e.message).join(', ');
    error.statusCode = 400;
  }
  
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }
  
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }
  
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

