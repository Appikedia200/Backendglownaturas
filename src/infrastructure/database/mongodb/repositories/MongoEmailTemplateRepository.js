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
    
    // Transform template to match frontend expectations
    const obj = template.toObject();
    obj.type = obj.templateType;
    return obj;
  }

  async findAll() {
    const templates = await EmailTemplate.find().sort('name');
    
    // Transform templates to match frontend expectations
    return templates.map(template => {
      const obj = template.toObject();
      // Map templateType to type for frontend compatibility
      obj.type = obj.templateType;
      return obj;
    });
  }

  async create(templateData) {
    const template = await EmailTemplate.create(templateData);
    
    // Transform template to match frontend expectations
    const obj = template.toObject();
    obj.type = obj.templateType;
    return obj;
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
    
    // Transform template to match frontend expectations
    const obj = template.toObject();
    obj.type = obj.templateType;
    return obj;
  }

  async delete(id) {
    const template = await EmailTemplate.findByIdAndDelete(id);
    if (!template) {
      throw new NotFoundError('Email template');
    }
  }
}

module.exports = MongoEmailTemplateRepository;

