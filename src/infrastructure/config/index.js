/**
 * Centralized Configuration Management
 * Single source of truth for all environment variables
 * @version 5.1.0
 */
class Config {
  // Database Configuration
  static get database() {
    return {
      uri: this.requireEnv('MONGODB_URI'),
      options: {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
      }
    };
  }

  // JWT Configuration
  static get jwt() {
    const secret = this.requireEnv('JWT_SECRET');
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }
    return {
      secret,
      expiresIn: process.env.JWT_EXPIRE || '30d',
    };
  }

  // Cloudinary Configuration
  static get cloudinary() {
    return {
      cloudName: this.requireEnv('CLOUDINARY_CLOUD_NAME'),
      apiKey: this.requireEnv('CLOUDINARY_API_KEY'),
      apiSecret: this.requireEnv('CLOUDINARY_API_SECRET'),
    };
  }

  // Email Configuration
  static get email() {
    return {
      apiKey: this.requireEnv('BREVO_API_KEY'),
      from: {
        email: this.requireEnv('FROM_EMAIL'),
        name: process.env.FROM_NAME || 'GlowNatura',
      }
    };
  }

  // URLs Configuration
  static get urls() {
    return {
      frontend: this.requireEnv('FRONTEND_URL'),
      admin: this.requireEnv('ADMIN_URL'),
    };
  }

  // Server Configuration
  static get server() {
    return {
      port: parseInt(process.env.PORT || '5000'),
      env: process.env.NODE_ENV || 'development',
      corsOrigins: [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ].filter(Boolean),
    };
  }

  // Security Configuration
  static get security() {
    return {
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      companyEmailDomain: this.requireEnv('COMPANY_EMAIL_DOMAIN'),
    };
  }

  // Payment Configuration
  static get payment() {
    return {
      bankName: process.env.BANK_NAME || 'First Bank Nigeria',
      accountNumber: process.env.ACCOUNT_NUMBER || '1234567890',
      accountName: process.env.ACCOUNT_NAME || 'GlowNatura',
    };
  }

  // Store Configuration
  static get store() {
    return {
      email: process.env.STORE_EMAIL || 'orders@glownatura.com',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '+2348012345678',
    };
  }

  // Helper to require environment variable
  static requireEnv(key) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  // Validate all required configs at startup
  static validate() {
    const logger = require('../../config/logger');
    
    try {
      this.database;
      this.jwt;
      this.cloudinary;
      this.email;
      this.urls;
      this.security;
      logger.info('Configuration validated successfully');
      return true;
    } catch (error) {
      logger.error('Configuration validation failed', { error: error.message });
      process.exit(1);
    }
  }
}

module.exports = Config;

