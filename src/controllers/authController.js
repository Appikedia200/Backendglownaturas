const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../config/logger');
const { sendEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// 1. Register admin
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }
    
    // Validate company email domain
    const companyDomain = process.env.COMPANY_EMAIL_DOMAIN || 'glownatura.com';
    if (!email.endsWith(`@${companyDomain}`)) {
      return res.status(400).json({
        success: false,
        error: `Please use your company email address (@${companyDomain})`
      });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }
    
    // Create admin with emailVerified: false
    const admin = await Admin.create({
      name,
      email,
      password,
      emailVerified: false
    });
    
    // Generate email verification token
    const verificationToken = admin.generateEmailVerificationToken();
    await admin.save({ validateBeforeSave: false });
    
    // Create verification URL
    const verificationUrl = `${process.env.ADMIN_URL}/verify-email?token=${verificationToken}`;
    
    // Send verification email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GlowNatura Admin Portal</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${admin.name},</p>
            <p>Thank you for registering as an admin for GlowNatura. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #059669;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 GlowNatura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({
      to: admin.email,
      subject: 'Verify Your GlowNatura Admin Account',
      html: emailHtml
    });
    
    logger.info(`Admin registered: ${admin.email} - verification email sent`);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        email: admin.email,
        emailVerified: false
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }
    logger.error(`Admin registration failed: ${error.message}`);
    next(error);
  }
};

// 2. Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Please provide verification token'
      });
    }
    
    // Hash token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find admin with valid token
    const admin = await Admin.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!admin) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is invalid or has expired'
      });
    }
    
    // Set email as verified
    admin.emailVerified = true;
    admin.emailVerificationToken = undefined;
    admin.emailVerificationExpires = undefined;
    await admin.save();
    
    // Generate JWT token for immediate login
    const jwtToken = generateToken(admin._id);
    
    logger.info(`Email verified: ${admin.email}`);
    
    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        emailVerified: true
      },
      token: jwtToken
    });
  } catch (error) {
    logger.error(`Email verification failed: ${error.message}`);
    next(error);
  }
};

// 3. Resend verification email
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email address'
      });
    }
    
    // Find admin
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    // Check if already verified
    if (admin.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }
    
    // Generate new verification token
    const verificationToken = admin.generateEmailVerificationToken();
    await admin.save({ validateBeforeSave: false });
    
    // Create verification URL
    const verificationUrl = `${process.env.ADMIN_URL}/verify-email?token=${verificationToken}`;
    
    // Send verification email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GlowNatura Admin Portal</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${admin.name},</p>
            <p>Here's your new verification link. Please click the button below to verify your email address:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #059669;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 GlowNatura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({
      to: admin.email,
      subject: 'Verify Your GlowNatura Admin Account',
      html: emailHtml
    });
    
    logger.info(`Verification email resent: ${admin.email}`);
    
    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (error) {
    logger.error(`Resend verification failed: ${error.message}`);
    next(error);
  }
};

// 4. Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Get admin with password
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Check if email is verified
    if (!admin.emailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification link.'
      });
    }
    
    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to too many failed login attempts. Please try again later or reset your password.'
      });
    }
    
    // Check password
    const isPasswordCorrect = await admin.comparePassword(password);
    
    if (!isPasswordCorrect) {
      await admin.incLoginAttempts();
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Reset login attempts on successful login
    if (admin.loginAttempts > 0 || admin.lockUntil) {
      await admin.resetLoginAttempts();
    }
    
    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();
    
    // Generate token
    const token = generateToken(admin._id);
    
    logger.info(`Admin login: ${admin.email}`);
    
    res.json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        emailVerified: admin.emailVerified,
        lastLogin: admin.lastLogin
      },
      token
    });
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    next(error);
  }
};

// 5. Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email address'
      });
    }
    
    // Find admin (don't reveal if exists for security)
    const admin = await Admin.findOne({ email });
    
    // Always return success message (don't reveal if email exists)
    const successMessage = 'If an account exists with this email, you will receive password reset instructions.';
    
    if (!admin) {
      // Log attempt for security monitoring
      logger.warn(`Password reset attempted for non-existent email: ${email}`);
      return res.json({
        success: true,
        message: successMessage
      });
    }
    
    // Generate password reset token
    const resetToken = admin.generatePasswordResetToken();
    await admin.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${resetToken}`;
    
    // Send password reset email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hi ${admin.name},</p>
            <p>We received a request to reset your password for your GlowNatura admin account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
            <div class="warning">
              <p style="margin: 0;"><strong>Important:</strong></p>
              <ul style="margin: 8px 0;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change unless you click the link and set a new one</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 GlowNatura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    try {
      await sendEmail({
        to: admin.email,
        subject: 'Password Reset Request - GlowNatura Admin',
        html: emailHtml
      });
      
      logger.info(`Password reset email sent: ${admin.email}`);
    } catch (emailError) {
      // Clear reset token if email fails
      admin.passwordResetToken = undefined;
      admin.passwordResetExpires = undefined;
      await admin.save({ validateBeforeSave: false });
      
      logger.error(`Password reset email failed: ${emailError.message}`);
      
      return res.status(500).json({
        success: false,
        error: 'Email could not be sent. Please try again later.'
      });
    }
    
    res.json({
      success: true,
      message: successMessage
    });
  } catch (error) {
    logger.error(`Forgot password failed: ${error.message}`);
    next(error);
  }
};

// 6. Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide token and new password'
      });
    }
    
    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }
    
    // Hash token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find admin with valid token
    const admin = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');
    
    if (!admin) {
      return res.status(400).json({
        success: false,
        error: 'Password reset token is invalid or has expired'
      });
    }
    
    // Update password
    admin.password = newPassword;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    
    // Reset login attempts and unlock account if locked
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    
    await admin.save();
    
    logger.info(`Password reset successful: ${admin.email}`);
    
    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    logger.error(`Password reset failed: ${error.message}`);
    next(error);
  }
};

// 7. Get current admin (me)
exports.getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error(`Get current admin failed: ${error.message}`);
    next(error);
  }
};

// 8. Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a name'
      });
    }
    
    const admin = await Admin.findById(req.admin._id);
    
    admin.name = name;
    await admin.save();
    
    logger.info(`Profile updated: ${admin.email}`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: admin
    });
  } catch (error) {
    logger.error(`Update profile failed: ${error.message}`);
    next(error);
  }
};

// 9. Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password and new password'
      });
    }
    
    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }
    
    const admin = await Admin.findById(req.admin._id).select('+password');
    
    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Update password
    admin.password = newPassword;
    await admin.save();
    
    logger.info(`Password changed: ${admin.email}`);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error(`Change password failed: ${error.message}`);
    next(error);
  }
};

// 10. Logout (client-side token deletion)
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
