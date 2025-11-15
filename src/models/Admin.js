const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const securityConfig = require('../config/security.config');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes for performance (email index auto-created by unique: true)
adminSchema.index({ emailVerificationToken: 1 });
adminSchema.index({ passwordResetToken: 1 });

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(securityConfig.auth.bcryptRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Use config instead of hardcoded values
  const maxAttempts = securityConfig.auth.maxLoginAttempts;
  const lockTimeMs = securityConfig.auth.accountLockHours * 60 * 60 * 1000;
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTimeMs };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Generate email verification token
adminSchema.methods.generateEmailVerificationToken = function() {
  // Generate random token
  const verificationToken = crypto
    .randomBytes(securityConfig.auth.tokenLength)
    .toString('hex');
  
  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set token expiration from config
  this.emailVerificationExpires = Date.now() + securityConfig.auth.emailVerificationExpiry;
  
  return verificationToken;
};

// Generate password reset token
adminSchema.methods.generatePasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto
    .randomBytes(securityConfig.auth.tokenLength)
    .toString('hex');
  
  // Hash token and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set token expiration from config
  this.passwordResetExpires = Date.now() + securityConfig.auth.passwordResetExpiry;
  
  return resetToken;
};

module.exports = mongoose.model('Admin', adminSchema);
