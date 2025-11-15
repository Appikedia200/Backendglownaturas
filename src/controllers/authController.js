/**
 * Authentication Controllers
 * HTTP request/response handlers for authentication endpoints
 * Single Responsibility: HTTP handling only
 * 
 * This controller contains NO business logic
 * All business logic is delegated to authService
 * 
 * @module controllers/authController
 * @version 5.1.0
 */

const authService = require('../services/authService');
const { validateEmail, validatePassword, validateName } = require('../validators/authValidator');
const { generateToken } = require('../utils/jwtHelper');
const logger = require('../config/logger');

/**
 * Register new admin
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: nameCheck.error
      });
    }
    
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: emailCheck.error
      });
    }
    
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: passwordCheck.error
      });
    }
    
    // Delegate to service
    const result = await authService.registerAdmin({
      name: nameCheck.value,
      email,
      password
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: result
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }
    
    logger.error(`Registration failed: ${error.message}`);
    next(error);
  }
};

/**
 * Verify email address
 * POST /api/auth/verify-email
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }
    
    // Delegate to service
    const adminData = await authService.verifyEmail(token);
    
    // Generate auth token
    const authToken = generateToken(adminData._id);
    
    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      data: adminData,
      token: authToken
    });
  } catch (error) {
    logger.error(`Email verification failed: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email address'
      });
    }
    
    // Delegate to service
    await authService.resendVerificationEmail(email);
    
    // Generic message (security - prevent email enumeration)
    res.json({
      success: true,
      message: 'If an account exists with this email and is unverified, you will receive a verification email.'
    });
  } catch (error) {
    logger.error(`Resend verification failed: ${error.message}`);
    next(error);
  }
};

/**
 * Admin login
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Delegate to service
    const adminData = await authService.loginAdmin(email, password);
    
    // Generate auth token
    const token = generateToken(adminData._id);
    
    res.json({
      success: true,
      data: adminData,
      token
    });
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    
    // Handle specific error codes
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        errorCode: error.code
      });
    }
    
    // Generic authentication failure
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your email address'
      });
    }
    
    // Delegate to service
    await authService.requestPasswordReset(email);
    
    // Generic message (security - prevent email enumeration)
    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  } catch (error) {
    logger.error(`Forgot password failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide token and new password'
      });
    }
    
    // Validate new password
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: passwordCheck.error
      });
    }
    
    // Delegate to service
    await authService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.'
    });
  } catch (error) {
    logger.error(`Reset password failed: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get current admin info
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    // Admin is already attached by auth middleware
    // Just return the data in consistent format
    res.json({
      success: true,
      data: {
        _id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        emailVerified: req.admin.emailVerified,
        createdAt: req.admin.createdAt,
        lastLogin: req.admin.lastLogin
      }
    });
  } catch (error) {
    logger.error(`Get current admin failed: ${error.message}`);
    next(error);
  }
};

/**
 * Update admin profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a name'
      });
    }
    
    // Validate name
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: nameCheck.error
      });
    }
    
    // Delegate to service
    const updatedAdmin = await authService.updateProfile(req.admin._id, {
      name: nameCheck.value
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAdmin
    });
  } catch (error) {
    logger.error(`Update profile failed: ${error.message}`);
    next(error);
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password and new password'
      });
    }
    
    // Prevent setting same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password'
      });
    }
    
    // Validate new password
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: passwordCheck.error
      });
    }
    
    // Delegate to service
    await authService.changePassword(req.admin._id, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error(`Change password failed: ${error.message}`);
    
    // Handle incorrect current password
    if (error.message === 'Current password is incorrect') {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
    
    next(error);
  }
};

/**
 * Logout admin
 * POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    logger.info(`Admin logout: ${req.admin.email}`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error(`Logout failed: ${error.message}`);
    next(error);
  }
};
