/**
 * Change Password Use Case
 * Handles password change for authenticated admin
 * @version 5.2.1
 */

const { UnauthorizedError, ValidationError, BadRequestError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const bcrypt = require('bcrypt');

class ChangePasswordUseCase {
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  async execute(adminId, currentPassword, newPassword) {
    // Validate inputs
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('New password must be different from current password');
    }

    // Get admin with password (need to select password field)
    const Admin = require('../../../infrastructure/database/mongodb/models/Admin');
    const admin = await Admin.findById(adminId).select('+password');
    
    if (!admin) {
      throw new UnauthorizedError('Admin not found');
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      logger.warn('Failed password change attempt - incorrect current password', {
        adminId: admin._id,
        email: admin.email
      });
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.adminRepository.update(admin._id, {
      password: hashedPassword
    });

    logger.info('Password changed successfully', {
      adminId: admin._id,
      email: admin.email
    });

    return {
      message: 'Password changed successfully'
    };
  }
}

module.exports = ChangePasswordUseCase;

