/**
 * Authentication Service
 * Business logic layer for authentication operations
 * Single Responsibility: Authentication business logic only
 * 
 * This service contains NO HTTP handling (no req/res)
 * All functions are pure business logic that can be called from controllers
 * 
 * @module services/authService
 * @version 5.1.0
 */

const crypto = require('crypto');
const Admin = require('../models/Admin');
const emailTemplateService = require('./emailTemplateService');
const { sendEmail } = require('../utils/emailService');
const logger = require('../config/logger');

/**
 * Register a new admin
 * @param {Object} adminData - { name, email, password }
 * @returns {Object} Registered admin data
 * @throws {Error} If email already exists or email sending fails
 */
exports.registerAdmin = async (adminData) => {
  const { name, email, password } = adminData;
  
  // Create admin account
  const admin = await Admin.create({
    name,
    email,
    password,
    emailVerified: false
  });
  
  // Generate email verification token
  const verificationToken = admin.generateEmailVerificationToken();
  await admin.save({ validateBeforeSave: false });
  
  // Prepare and send verification email
  const verificationUrl = `${process.env.ADMIN_URL}/verify-email?token=${verificationToken}`;
  const emailTemplate = emailTemplateService.getVerificationEmailTemplate(admin.name, verificationUrl);
  
  try {
    await sendEmail({
      to: admin.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });
    
    logger.info(`Admin registered successfully: ${admin.email}`);
  } catch (emailError) {
    // Log error but don't delete account - user can resend verification
    logger.error(`Failed to send verification email for ${email}: ${emailError.message}`, {
      adminId: admin._id,
      error: emailError.stack
    });
    
    logger.warn(`Account created but verification email failed for ${email}. User should use /resend-verification endpoint.`);
    
    // Return success but indicate email issue
    return {
      email: admin.email,
      emailVerified: false,
      emailDeliveryWarning: 'Account created but verification email may not have been delivered. Please check spam or request a new verification email.'
    };
  }
  
  return {
    email: admin.email,
    emailVerified: false
  };
};

/**
 * Verify admin email with token
 * @param {string} token - Email verification token
 * @returns {Object} Verified admin data
 * @throws {Error} If token is invalid or expired
 */
exports.verifyEmail = async (token) => {
  // Hash the token for comparison
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
    throw new Error('Invalid or expired verification token');
  }
  
  // Mark email as verified
  admin.emailVerified = true;
  admin.emailVerificationToken = undefined;
  admin.emailVerificationExpires = undefined;
  await admin.save();
  
  logger.info(`Email verified successfully: ${admin.email}`);
  
  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    emailVerified: admin.emailVerified
  };
};

/**
 * Resend verification email
 * @param {string} email - Admin email address
 * @returns {boolean} Success status
 */
exports.resendVerificationEmail = async (email) => {
  const admin = await Admin.findOne({ email });
  
  // Return success even if admin doesn't exist (security - prevent enumeration)
  if (!admin) {
    logger.warn(`Verification resend attempted for non-existent email: ${email}`);
    return true;
  }
  
  // Return success if already verified (security - prevent enumeration)
  if (admin.emailVerified) {
    logger.info(`Verification resend attempted for already verified email: ${email}`);
    return true;
  }
  
  // Generate new verification token
  const verificationToken = admin.generateEmailVerificationToken();
  await admin.save({ validateBeforeSave: false });
  
  // Send verification email
  const verificationUrl = `${process.env.ADMIN_URL}/verify-email?token=${verificationToken}`;
  const emailTemplate = emailTemplateService.getVerificationEmailTemplate(admin.name, verificationUrl);
  
  await sendEmail({
    to: admin.email,
    subject: emailTemplate.subject,
    html: emailTemplate.html
  });
  
  logger.info(`Verification email resent to: ${admin.email}`);
  return true;
};

/**
 * Authenticate admin login
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Object} Authenticated admin data
 * @throws {Error} With specific error codes for different scenarios
 */
exports.loginAdmin = async (email, password) => {
  // Find admin with password field
  const admin = await Admin.findOne({ email }).select('+password');
  
  if (!admin) {
    throw new Error('Invalid email or password');
  }
  
  // Check if email is verified
  if (!admin.emailVerified) {
    const error = new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    error.code = 'EMAIL_NOT_VERIFIED';
    error.statusCode = 403;
    throw error;
  }
  
  // Check if account is locked
  if (admin.isLocked()) {
    const error = new Error('Too many authentication attempts, please try again later.');
    error.code = 'ACCOUNT_LOCKED';
    error.statusCode = 423;
    throw error;
  }
  
  // Verify password
  const isPasswordCorrect = await admin.comparePassword(password);
  
  if (!isPasswordCorrect) {
    // Increment failed login attempts
    await admin.incLoginAttempts();
    throw new Error('Invalid email or password');
  }
  
  // Reset login attempts on successful login
  if (admin.loginAttempts > 0 || admin.lockUntil) {
    await admin.resetLoginAttempts();
  }
  
  // Update last login timestamp
  admin.lastLogin = Date.now();
  await admin.save();
  
  logger.info(`Admin login successful: ${admin.email}`);
  
  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    emailVerified: admin.emailVerified,
    lastLogin: admin.lastLogin
  };
};

/**
 * Request password reset
 * @param {string} email - Admin email address
 * @returns {boolean} Success status
 */
exports.requestPasswordReset = async (email) => {
  const admin = await Admin.findOne({ email });
  
  // Return success even if admin doesn't exist (security - prevent enumeration)
  if (!admin) {
    logger.warn(`Password reset requested for non-existent email: ${email}`);
    return true;
  }
  
  // Generate password reset token
  const resetToken = admin.generatePasswordResetToken();
  await admin.save({ validateBeforeSave: false });
  
  // Send password reset email
  const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${resetToken}`;
  const emailTemplate = emailTemplateService.getPasswordResetEmailTemplate(admin.name, resetUrl);
  
  try {
    await sendEmail({
      to: admin.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });
    
    logger.info(`Password reset email sent: ${admin.email}`);
  } catch (emailError) {
    // Clear reset token if email fails
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save({ validateBeforeSave: false });
    
    logger.error(`Failed to send password reset email: ${emailError.message}`);
    throw new Error('Failed to send password reset email. Please try again.');
  }
  
  return true;
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {boolean} Success status
 * @throws {Error} If token is invalid or expired
 */
exports.resetPassword = async (token, newPassword) => {
  // Hash the token for comparison
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Find admin with valid reset token
  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!admin) {
    throw new Error('Password reset token is invalid or has expired');
  }
  
  // Update password
  admin.password = newPassword;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  
  // Also reset login attempts and unlock account
  admin.loginAttempts = 0;
  admin.lockUntil = undefined;
  
  await admin.save();
  
  logger.info(`Password reset completed: ${admin.email}`);
  return true;
};

/**
 * Update admin profile
 * @param {string} adminId - Admin ID
 * @param {Object} updates - Profile updates { name }
 * @returns {Object} Updated admin data
 * @throws {Error} If admin not found
 */
exports.updateProfile = async (adminId, updates) => {
  const admin = await Admin.findById(adminId);
  
  if (!admin) {
    throw new Error('Admin not found');
  }
  
  // Update allowed fields
  if (updates.name !== undefined) {
    admin.name = updates.name;
  }
  
  await admin.save();
  
  logger.info(`Profile updated: ${admin.email}`);
  
  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    emailVerified: admin.emailVerified,
    lastLogin: admin.lastLogin
  };
};

/**
 * Change admin password
 * @param {string} adminId - Admin ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {boolean} Success status
 * @throws {Error} If current password is incorrect
 */
exports.changePassword = async (adminId, currentPassword, newPassword) => {
  const admin = await Admin.findById(adminId).select('+password');
  
  if (!admin) {
    throw new Error('Admin not found');
  }
  
  // Verify current password
  const isMatch = await admin.comparePassword(currentPassword);
  
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }
  
  // Update to new password
  admin.password = newPassword;
  await admin.save();
  
  logger.info(`Password changed: ${admin.email}`);
  return true;
};

/**
 * Get admin by ID
 * @param {string} adminId - Admin ID
 * @returns {Object} Admin data
 * @throws {Error} If admin not found
 */
exports.getAdminById = async (adminId) => {
  const admin = await Admin.findById(adminId);
  
  if (!admin) {
    throw new Error('Admin not found');
  }
  
  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    emailVerified: admin.emailVerified,
    createdAt: admin.createdAt,
    lastLogin: admin.lastLogin
  };
};

