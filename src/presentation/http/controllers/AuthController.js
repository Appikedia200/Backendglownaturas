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
   * Get current admin
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      res.json(Response.success({ admin: req.admin }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

