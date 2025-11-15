/**
 * JWT Helper Utility
 * Handles JWT token generation and verification
 * Single Responsibility: JWT operations only
 * 
 * @module utils/jwtHelper
 * @version 5.1.0
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Generate JWT authentication token
 * @param {string} adminId - Admin ID to encode in token
 * @returns {string} JWT token
 * @throws {Error} If token generation fails
 */
exports.generateToken = (adminId) => {
  try {
    return jwt.sign(
      { id: adminId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  } catch (error) {
    logger.error(`JWT generation failed: ${error.message}`);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token verification fails
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error(`JWT verification failed: ${error.message}`);
    throw error;
  }
};

