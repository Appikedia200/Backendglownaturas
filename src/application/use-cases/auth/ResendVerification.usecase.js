/**
 * Resend Verification Use Case
 * Resends verification code to admin email
 * @version 5.1.0
 */

const { BadRequestError, NotFoundError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const jwt = require('jsonwebtoken');
const Config = require('../../../infrastructure/config');

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
      await this.emailService.sendVerificationLink(email, admin.name, verificationLink);
      
      logger.info('Verification link resent', { email, adminId: admin._id });
    } catch (error) {
      logger.error('Failed to resend verification email', { 
        email, 
        error: error.message 
      });
      throw new Error('Failed to send verification email. Please try again later.');
    }

    return {
      message: 'Verification link has been resent to your email',
      email: admin.email
    };
  }
}

module.exports = ResendVerificationUseCase;

