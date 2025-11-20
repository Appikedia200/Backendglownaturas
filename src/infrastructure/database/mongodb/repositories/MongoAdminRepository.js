/**
 * MongoDB Admin Repository Implementation (Adapter)
 * Implements IAdminRepository using Mongoose
 * @version 5.1.0
 */

const IAdminRepository = require('../../../../domain/repositories/IAdminRepository');
const Admin = require('../models/Admin');
const { NotFoundError } = require('../../../../shared/errors/AppError');

class MongoAdminRepository extends IAdminRepository {
  async findByEmail(email) {
    return await Admin.findOne({ email }).select('+password');
  }

  async findById(id) {
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new NotFoundError('Admin');
    }
    return admin;
  }

  async create(adminData) {
    const admin = await Admin.create(adminData);
    return admin;
  }

  async update(id, updates) {
    const admin = await Admin.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!admin) {
      throw new NotFoundError('Admin');
    }
    
    return admin;
  }

  async findByResetToken(token) {
    return await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  }

  async findByVerificationCode(email, code) {
    return await Admin.findOne({
      email,
      emailVerificationToken: code,
      emailVerificationExpires: { $gt: Date.now() }
    });
  }

  async findAll(filters = {}) {
    const query = {};
    
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.emailVerified !== undefined) {
      query.emailVerified = filters.emailVerified;
    }
    
    return await Admin.find(query).select('-password');
  }

  async delete(id) {
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      throw new NotFoundError('Admin');
    }
  }
}

module.exports = MongoAdminRepository;

