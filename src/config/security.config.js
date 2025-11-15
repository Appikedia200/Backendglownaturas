/**
 * Security Configuration
 * Centralized security parameters for the authentication system
 * Can be overridden by environment variables for different environments
 * 
 * @module config/security
 * @version 5.1.0
 */

module.exports = {
  // Authentication settings
  auth: {
    // Maximum login attempts before account lock
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    
    // Account lock duration in hours
    accountLockHours: parseInt(process.env.ACCOUNT_LOCK_HOURS) || 2,
    
    // Bcrypt hashing rounds (cost factor)
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    
    // JWT token expiration
    jwtExpiration: process.env.JWT_EXPIRE || '7d',
    
    // Token expiration times (in milliseconds)
    emailVerificationExpiry: 24 * 60 * 60 * 1000, // 24 hours
    passwordResetExpiry: 60 * 60 * 1000, // 1 hour
    
    // Token length in bytes for crypto tokens
    tokenLength: 32
  },
  
  // Password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '@$!%*?&#'
  },
  
  // Rate limiting
  rateLimit: {
    // Auth endpoints (login, register, etc.)
    authWindowMs: 15 * 60 * 1000, // 15 minutes
    authMaxRequests: 5,
    
    // General API endpoints
    generalWindowMs: 15 * 60 * 1000, // 15 minutes
    generalMaxRequests: 100,
    
    // Order creation
    orderWindowMs: 60 * 60 * 1000, // 1 hour
    orderMaxRequests: 10,
    
    // Review submission
    reviewWindowMs: 60 * 60 * 1000, // 1 hour
    reviewMaxRequests: 5
  },
  
  // Email settings
  email: {
    retryAttempts: 3,
    retryDelay: 2000 // milliseconds
  }
};

