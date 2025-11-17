/**
 * Reset Password Use Case
 * Handles password reset business logic
 * @version 5.1.0
 */

const { ValidationError, NotFoundError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const crypto = require('crypto');

class ResetPasswordUseCase {
  /**
   * @param {IAdminRepository} adminRepository
   * @param {IEmailService} emailService
   */
  constructor(adminRepository, emailService) {
    this.adminRepository = adminRepository;
    this.emailService = emailService;
  }

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise<{message: string}>}
   */
  async requestReset(email) {
    const admin = await this.adminRepository.findByEmail(email);
    
    if (!admin) {
      // Don't reveal if email exists
      logger.warn('Password reset requested for non-existent email', { email });
      return {
        message: 'If email exists, reset instructions have been sent.'
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.adminRepository.update(admin._id, {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: resetTokenExpires
    });

    // Send reset email
    try {
      const resetUrl = `${process.env.ADMIN_URL}/reset-password/${resetToken}`;
      await this.emailService.send(
        email,
        'Password Reset Request',
        `
          <h1>Password Reset</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      );
    } catch (error) {
      logger.error('Failed to send password reset email', { 
        email, 
        error: error.message 
      });
    }

    logger.info('Password reset requested', { email });

    return {
      message: 'If email exists, reset instructions have been sent.'
    };
  }

  /**
   * Execute password reset
   * @param {Object} dto
   * @param {string} dto.token
   * @param {string} dto.newPassword
   * @returns {Promise<{message: string}>}
   */
  async executeReset(dto) {
    const { token, newPassword } = dto;

    // Validate password
    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Hash token to compare with database
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find admin by reset token
    const admin = await this.adminRepository.findByResetToken(resetTokenHash);
    
    if (!admin) {
      logger.warn('Password reset attempted with invalid token');
      throw new ValidationError('Invalid or expired reset token');
    }

    // Update password
    admin.password = newPassword; // Will be hashed by model middleware
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    
    await this.adminRepository.update(admin._id, {
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    logger.info('Password reset successfully', { 
      adminId: admin._id, 
      email: admin.email 
    });

    return {
      message: 'Password reset successfully. You can now login with your new password.'
    };
  }
}

module.exports = ResetPasswordUseCase;

