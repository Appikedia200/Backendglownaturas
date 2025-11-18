/**
 * Register Admin Use Case
 * Handles admin registration business logic
 * @version 5.1.0
 */

const { ValidationError, ConflictError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

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
   * @returns {Promise<{admin: Object, verificationCode: string}>}
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

    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create admin
    const admin = await this.adminRepository.create({
      name,
      email,
      password, // Will be hashed by model middleware
      role,
      verificationCode,
      verificationCodeExpires,
      isActive: false, // Require verification
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationCode(email, name, verificationCode);
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
    delete adminData.verificationCode;

    return {
      admin: adminData,
      message: 'Account created successfully. Please check your email for the verification code to activate your account.'
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

  /**
   * Generate 6-digit verification code
   * @private
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

module.exports = RegisterAdminUseCase;

