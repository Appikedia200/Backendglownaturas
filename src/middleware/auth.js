const jwt = require('jsonwebtoken');
const Admin = require('../infrastructure/database/mongodb/models/Admin');
const logger = require('../config/logger');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Please login.',
        errorCode: 'NO_TOKEN'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get admin from token
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Admin account not found. Please login again.',
        errorCode: 'ADMIN_NOT_FOUND'
      });
    }
    
    // Check if email is still verified
    if (!admin.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified. Please verify your email address.',
        errorCode: 'EMAIL_NOT_VERIFIED'
      });
    }
    
    // Attach admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    // ENHANCED: Specific error handling based on error type
    
    // Token expired
    if (error.name === 'TokenExpiredError') {
      logger.warn(`Token expired for request to ${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        error: 'Your session has expired. Please login again.',
        errorCode: 'TOKEN_EXPIRED'
      });
    }
    
    // Token malformed or signature invalid
    if (error.name === 'JsonWebTokenError') {
      logger.warn(`Invalid token for request to ${req.originalUrl}: ${error.message}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token. Please login again.',
        errorCode: 'TOKEN_INVALID'
      });
    }
    
    // Token not yet valid (nbf claim)
    if (error.name === 'NotBeforeError') {
      logger.warn(`Token not yet active for request to ${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        error: 'Authentication token not yet valid.',
        errorCode: 'TOKEN_NOT_ACTIVE'
      });
    }
    
    // Generic fallback for unexpected errors
    logger.error(`Authentication error for ${req.originalUrl}: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Please login again.',
      errorCode: 'AUTH_FAILED'
    });
  }
};
