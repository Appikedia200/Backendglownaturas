/**
 * Login Use Case
 * Handles admin authentication business logic
 * @version 5.1.0
 */

const { UnauthorizedError, ValidationError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const jwt = require('jsonwebtoken');
const Config = require('../../../infrastructure/config');

class LoginUseCase {
  /**
   * @param {IAdminRepository} adminRepository
   */
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  /**
   * Execute login
   * @param {Object} dto
   * @param {string} dto.email
   * @param {string} dto.password
   * @param {string} dto.twoFactorCode - Optional 2FA code
   * @returns {Promise<{admin: Object, token: string}>}
   */
  async execute(dto) {
    const { email, password, twoFactorCode } = dto;

    // Find admin by email
    const admin = await this.adminRepository.findByEmail(email);
    
    if (!admin) {
      logger.warn('Login attempt with invalid email', { email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if admin is active
    if (!admin.isActive) {
      logger.warn('Login attempt for inactive admin', { email });
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      admin.failedLoginAttempts += 1;
      
      if (admin.failedLoginAttempts >= 5) {
        admin.isActive = false;
        logger.warn('Admin account locked due to failed attempts', { email });
        await admin.save();
        throw new UnauthorizedError('Account locked due to multiple failed login attempts');
      }
      
      await admin.save();
      logger.warn('Login attempt with invalid password', { email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check 2FA if enabled
    if (admin.twoFactorEnabled) {
      if (!twoFactorCode) {
        return {
          requiresTwoFactor: true,
          message: '2FA code required'
        };
      }

      const isCodeValid = await admin.verifyTwoFactorCode(twoFactorCode);
      
      if (!isCodeValid) {
        logger.warn('Login attempt with invalid 2FA code', { email });
        throw new UnauthorizedError('Invalid 2FA code');
      }
    }

    // Reset failed attempts on successful login
    admin.failedLoginAttempts = 0;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = this.generateToken(admin);

    logger.info('Admin logged in successfully', { 
      adminId: admin._id, 
      email: admin.email,
      role: admin.role 
    });

    // Return admin without sensitive data
    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.twoFactorSecret;

    return {
      admin: adminData,
      token
    };
  }

  /**
   * Generate JWT token
   * @private
   */
  generateToken(admin) {
    const payload = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    };

    return jwt.sign(payload, Config.jwt.secret, {
      expiresIn: Config.jwt.expiresIn
    });
  }
}

module.exports = LoginUseCase;

