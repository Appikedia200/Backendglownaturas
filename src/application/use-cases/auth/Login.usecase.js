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
   * @returns {Promise<{admin: Object, token: string}>}
   */
  async execute(dto) {
    const { email, password } = dto;

    // Find admin by email
    const admin = await this.adminRepository.findByEmail(email);
    
    if (!admin) {
      logger.warn('Login attempt with invalid email', { email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if admin email is verified
    if (!admin.emailVerified) {
      logger.warn('Login attempt for unverified admin', { email });
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    // Check if account is locked
    if (admin.isLocked && admin.isLocked()) {
      logger.warn('Login attempt on locked account', { email });
      throw new UnauthorizedError('Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts using model method
      await admin.incLoginAttempts();
      
      logger.warn('Login attempt with invalid password', { email, attempts: admin.loginAttempts + 1 });
      
      if (admin.loginAttempts + 1 >= 5) {
        throw new UnauthorizedError('Account locked due to multiple failed login attempts. Try again in 2 hours.');
      }
      
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset login attempts and update last login in one operation
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
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
    delete adminData.emailVerificationToken;
    delete adminData.passwordResetToken;

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

