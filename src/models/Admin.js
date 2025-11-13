const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    validate: {
      validator: function(email) {
        return email.endsWith('@glownaturas.com');
      },
      message: 'Only @glownaturas.com email addresses are allowed'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  passwordResetCode: String,
  passwordResetExpires: Date,
  lastLogin: Date
}, { 
  timestamps: true 
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.createEmailVerificationCode = function() {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode = crypto.createHash('sha256').update(verificationCode).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return verificationCode;
};

adminSchema.methods.createPasswordResetCode = function() {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return resetCode;
};

module.exports = mongoose.model('Admin', adminSchema);

