/**
 * Auth HTTP Controller
 * Handles HTTP requests for authentication - NO business logic
 * @version 5.1.0
 */

const Response = require('../../../shared/utils/Response');

class AuthController {
  /**
   * @param {LoginUseCase} loginUseCase
   * @param {RegisterAdminUseCase} registerUseCase
   * @param {VerifyEmailUseCase} verifyEmailUseCase
   * @param {VerifyEmailWithTokenUseCase} verifyEmailWithTokenUseCase
   * @param {ResetPasswordUseCase} resetPasswordUseCase
   * @param {ResendVerificationUseCase} resendVerificationUseCase
   */
  constructor(loginUseCase, registerUseCase, verifyEmailUseCase, verifyEmailWithTokenUseCase, resetPasswordUseCase, resendVerificationUseCase) {
    this.loginUseCase = loginUseCase;
    this.registerUseCase = registerUseCase;
    this.verifyEmailUseCase = verifyEmailUseCase;
    this.verifyEmailWithTokenUseCase = verifyEmailWithTokenUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
    this.resendVerificationUseCase = resendVerificationUseCase;
  }

  /**
   * Login
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json(Response.created(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email (POST - with code, for backward compatibility)
   * POST /api/auth/verify-email
   */
  async verifyEmail(req, res, next) {
    try {
      const result = await this.verifyEmailUseCase.execute(req.body);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email with token (GET - with JWT token from link)
   * GET /api/auth/verify-email?token=xyz
   */
  async verifyEmailWithToken(req, res, next) {
    try {
      const { token } = req.query;
      const result = await this.verifyEmailWithTokenUseCase.execute(token);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const result = await this.resetPasswordUseCase.requestReset(req.body.email);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const result = await this.resetPasswordUseCase.executeReset(req.body);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend verification code
   * POST /api/auth/resend-verification
   */
  async resendVerification(req, res, next) {
    try {
      const result = await this.resendVerificationUseCase.execute(req.body);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // Since we're using JWT (stateless), we don't need to invalidate on server
      // Client will remove the token from cookies
      logger.info('Admin logged out', {
        adminId: req.admin?._id,
        email: req.admin?.email
      });
      
      res.json(Response.success({ message: 'Logged out successfully' }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password for logged-in admin
   * POST /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters long'
        });
      }
      
      // Verify current password
      const admin = await this.adminRepository.findById(req.admin._id);
      const isValid = await admin.comparePassword(currentPassword);
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
      
      // Update password
      admin.password = newPassword;  // Will be hashed by pre-save hook
      await admin.save();
      
      logger.info('Password changed successfully', {
        adminId: admin._id,
        email: admin.email
      });
      
      res.json(Response.success({
        message: 'Password changed successfully'
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current admin
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      // Return admin data without sensitive fields
      const adminData = req.admin.toObject();
      delete adminData.password;
      delete adminData.emailVerificationToken;
      delete adminData.emailVerificationExpires;
      delete adminData.passwordResetToken;
      delete adminData.passwordResetExpires;
      delete adminData.loginAttempts;
      delete adminData.lockUntil;
      
      // Add 'active' field for frontend compatibility (maps to emailVerified)
      adminData.active = adminData.emailVerified;
      
      res.json(Response.success(adminData));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

