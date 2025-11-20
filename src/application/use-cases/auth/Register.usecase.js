/**
 * Register Admin Use Case
 * Handles admin registration business logic
 * @version 5.1.0
 */

const { ValidationError, ConflictError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const jwt = require('jsonwebtoken');
const Config = require('../../../infrastructure/config');

class RegisterAdminUseCase {
  /**
   * @param {IAdminRepository} adminRepository
   * @param {IEmailService} emailService
   */
  constructor(adminRepository, emailService) {
    this.adminRepository = adminRepository;
    this.emailService = emailService;
  }

  /**
   * Execute registration
   * @param {Object} dto
   * @param {string} dto.name
   * @param {string} dto.email
   * @param {string} dto.password
   * @param {string} dto.role - Optional, defaults to 'admin'
   * @returns {Promise<{admin: Object, message: string}>}
   */
  async execute(dto) {
    const { name, email, password, role = 'admin' } = dto;

    // Validate business rules
    await this.validateBusinessRules(dto);

    // Check if email already exists
    const existingAdmin = await this.adminRepository.findByEmail(email);
    
    if (existingAdmin) {
      logger.warn('Registration attempt with existing email', { email });
      throw new ConflictError('Email already registered');
    }

    // Create admin (unverified)
    const admin = await this.adminRepository.create({
      name,
      email,
      password, // Will be hashed by model middleware
      role,
      emailVerified: false, // Require verification
    });

    // Generate JWT verification token (valid for 24 hours)
    const verificationToken = jwt.sign(
      { 
        adminId: admin._id.toString(),
        email: admin.email,
        purpose: 'email_verification'
      },
      Config.jwt.secret,
      { expiresIn: '24h' }
    );

    // Build verification link
    const verificationLink = `${Config.urls.admin}/verify-email?token=${verificationToken}`;

    // Send verification email with link
    try {
      await this.emailService.sendVerificationLink(email, name, verificationLink);
    } catch (error) {
      logger.error('Failed to send verification email', { 
        email, 
        adminName: name,
        error: error.message 
      });
      // Don't fail registration if email fails
    }

    logger.info('Admin registered successfully', { 
      adminId: admin._id, 
      email: admin.email,
      role: admin.role 
    });

    // Return admin without sensitive data
    const adminData = admin.toObject();
    delete adminData.password;

    return {
      admin: adminData,
      message: 'Account created successfully! Please check your email and click the verification link to activate your account.'
    };
  }

  /**
   * Validate business rules
   * @private
   */
  async validateBusinessRules(dto) {
    // Validate password strength
    if (dto.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Validate email format (basic check, validator middleware handles more)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate role
    const validRoles = ['admin', 'superadmin'];
    if (dto.role && !validRoles.includes(dto.role)) {
      throw new ValidationError('Invalid role');
    }
  }
}

module.exports = RegisterAdminUseCase;

