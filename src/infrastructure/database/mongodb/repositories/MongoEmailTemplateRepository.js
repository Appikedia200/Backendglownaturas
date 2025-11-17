/**
 * MongoDB Email Template Repository Implementation (Adapter)
 * Implements IEmailTemplateRepository using Mongoose
 * @version 5.1.0
 */

const IEmailTemplateRepository = require('../../../../domain/repositories/IEmailTemplateRepository');
const EmailTemplate = require('../models/EmailTemplate');
const { NotFoundError } = require('../../../../shared/errors/AppError');

class MongoEmailTemplateRepository extends IEmailTemplateRepository {
  async findByName(name) {
    return await EmailTemplate.findOne({ name, isActive: true });
  }

  async findById(id) {
    const template = await EmailTemplate.findById(id);
    if (!template) {
      throw new NotFoundError('Email template');
    }
    return template;
  }

  async findAll() {
    return await EmailTemplate.find().sort('name');
  }

  async create(templateData) {
    const template = await EmailTemplate.create(templateData);
    return template;
  }

  async update(id, updates) {
    const template = await EmailTemplate.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!template) {
      throw new NotFoundError('Email template');
    }
    
    return template;
  }

  async delete(id) {
    const template = await EmailTemplate.findByIdAndDelete(id);
    if (!template) {
      throw new NotFoundError('Email template');
    }
  }
}

module.exports = MongoEmailTemplateRepository;

