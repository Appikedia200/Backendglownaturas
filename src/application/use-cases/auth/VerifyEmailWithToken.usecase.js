/**
 * Verify Email With Token Use Case
 * Verifies admin email using JWT token from link
 * @version 5.1.0
 */

const { UnauthorizedError, BadRequestError, NotFoundError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const jwt = require('jsonwebtoken');
const Config = require('../../../infrastructure/config');

class VerifyEmailWithTokenUseCase {
  /**
   * @param {IAdminRepository} adminRepository
   */
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  /**
   * Execute email verification with token and auto-login
   * @param {string} token - JWT verification token
   * @returns {Promise<{admin: Object, token: string, message: string}>}
   */
  async execute(token) {
    if (!token) {
      throw new BadRequestError('Verification token is required');
    }

    // Verify and decode JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, Config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Verification link has expired. Please request a new one.');
      }
      throw new UnauthorizedError('Invalid verification link');
    }

    // Check token purpose
    if (decoded.purpose !== 'email_verification') {
      throw new UnauthorizedError('Invalid verification token');
    }

    // Find admin
    const admin = await this.adminRepository.findById(decoded.adminId);
    
    if (!admin) {
      throw new NotFoundError('Admin account not found');
    }

    // Check if already verified
    if (admin.emailVerified) {
      throw new BadRequestError('Account is already verified');
    }

    // Activate admin account
    await this.adminRepository.update(admin._id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    logger.info('Admin email verified successfully', { 
      adminId: admin._id, 
      email: admin.email 
    });

    // Generate JWT login token
    const loginToken = jwt.sign(
      { 
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role
      },
      Config.jwt.secret,
      { expiresIn: Config.jwt.expiresIn }
    );

    // Return admin data and login token
    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.emailVerificationToken;
    delete adminData.emailVerificationExpires;

    return {
      admin: adminData,
      token: loginToken,
      message: 'Email verified successfully! You are now logged in.'
    };
  }
}

module.exports = VerifyEmailWithTokenUseCase;

