const crypto = require('crypto');
const Admin = require('../models/Admin');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { sendTokenResponse } = require('../utils/tokenGenerator');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    const admin = await Admin.create({ name, email, password });
    const verificationCode = admin.createEmailVerificationCode();
    await admin.save();
    await sendVerificationEmail(admin, verificationCode);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email for verification code.'
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const admin = await Admin.findOne({
      email: email.toLowerCase(),
      emailVerificationCode: hashedCode,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!admin) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }
    
    admin.isEmailVerified = true;
    admin.isActive = true;
    admin.emailVerificationCode = undefined;
    admin.emailVerificationExpires = undefined;
    await admin.save();
    
    res.json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin || !admin.isEmailVerified || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials or account not verified'
      });
    }
    
    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    admin.lastLogin = Date.now();
    await admin.save();
    
    sendTokenResponse(admin, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'No account with that email'
      });
    }
    
    const resetCode = admin.createPasswordResetCode();
    await admin.save();
    await sendPasswordResetEmail(admin, resetCode);
    
    res.json({
      success: true,
      message: 'Password reset code sent'
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const admin = await Admin.findOne({
      email: email.toLowerCase(),
      passwordResetCode: hashedCode,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!admin) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset code'
      });
    }
    
    admin.password = newPassword;
    admin.passwordResetCode = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      isEmailVerified: req.admin.isEmailVerified,
      lastLogin: req.admin.lastLogin
    }
  });
};

exports.updatePassword = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('+password');
    const isMatch = await admin.comparePassword(req.body.currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    admin.password = req.body.newPassword;
    await admin.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleAdminStatus = async (req, res, next) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      message: `Admin ${req.body.isActive ? 'activated' : 'deactivated'}`,
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ 
      email: email.toLowerCase(),
      isEmailVerified: false 
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'No unverified account with that email'
      });
    }
    
    const verificationCode = admin.createEmailVerificationCode();
    await admin.save();
    await sendVerificationEmail(admin, verificationCode);
    
    res.json({
      success: true,
      message: 'New verification code sent'
    });
  } catch (error) {
    next(error);
  }
};

