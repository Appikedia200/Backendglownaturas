/**
 * Verify Email Use Case
 * Handles email verification business logic
 * @version 5.1.0
 */

const { ValidationError, NotFoundError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

class VerifyEmailUseCase {
  /**
   * @param {IAdminRepository} adminRepository
   */
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  /**
   * Execute email verification
   * @param {Object} dto
   * @param {string} dto.email
   * @param {string} dto.code
   * @returns {Promise<{admin: Object, message: string}>}
   */
  async execute(dto) {
    const { email, code } = dto;

    // Find admin by email and verification code
    const admin = await this.adminRepository.findByVerificationCode(email, code);
    
    if (!admin) {
      logger.warn('Invalid or expired verification code', { email });
      throw new ValidationError('Invalid or expired verification code');
    }

    // Activate admin account
    admin.isActive = true;
    admin.verificationCode = undefined;
    admin.verificationCodeExpires = undefined;
    
    await this.adminRepository.update(admin._id, {
      isActive: true,
      verificationCode: null,
      verificationCodeExpires: null
    });

    logger.info('Email verified successfully', { 
      adminId: admin._id, 
      email: admin.email 
    });

    // Return admin without sensitive data
    const adminData = admin.toObject();
    delete adminData.password;

    return {
      admin: adminData,
      message: 'Email verified successfully. You can now login.'
    };
  }
}

module.exports = VerifyEmailUseCase;

