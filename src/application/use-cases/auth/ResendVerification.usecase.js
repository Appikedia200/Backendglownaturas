/**
 * Resend Verification Use Case
 * Resends verification code to admin email
 * @version 5.1.0
 */

const { BadRequestError, NotFoundError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

class ResendVerificationUseCase {
  /**
   * @param {IAdminRepository} adminRepository
   * @param {IEmailService} emailService
   */
  constructor(adminRepository, emailService) {
    this.adminRepository = adminRepository;
    this.emailService = emailService;
  }

  /**
   * Execute resend verification
   * @param {Object} dto
   * @param {string} dto.email
   * @returns {Promise<Object>}
   */
  async execute(dto) {
    const { email } = dto;

    // Find admin by email
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new NotFoundError('No account found with this email address');
    }

    // Check if already verified
    if (admin.isActive) {
      throw new BadRequestError('Account is already verified');
    }

    // Generate new verification code
    const verificationCode = this.generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update admin with new code
    await this.adminRepository.update(admin._id, {
      verificationCode,
      verificationCodeExpires
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationCode(email, admin.name, verificationCode);
      
      logger.info('Verification code resent', { email, adminId: admin._id });
    } catch (error) {
      logger.error('Failed to resend verification email', { 
        email, 
        error: error.message 
      });
      throw new Error('Failed to send verification email. Please try again later.');
    }

    return {
      message: 'Verification code has been resent to your email',
      email: admin.email
    };
  }

  /**
   * Generate 6-digit verification code
   * @private
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

module.exports = ResendVerificationUseCase;

