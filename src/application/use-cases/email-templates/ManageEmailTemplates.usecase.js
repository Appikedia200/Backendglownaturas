/**
 * Manage Email Templates Use Case
 * Handles email template business logic
 * @version 5.1.0
 */

const { ValidationError, ConflictError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

class ManageEmailTemplatesUseCase {
  /**
   * @param {IEmailTemplateRepository} emailTemplateRepository
   */
  constructor(emailTemplateRepository) {
    this.emailTemplateRepository = emailTemplateRepository;
  }

  /**
   * Get all templates
   */
  async getAllTemplates() {
    return await this.emailTemplateRepository.findAll();
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    return await this.emailTemplateRepository.findById(id);
  }

  /**
   * Get template by name
   */
  async getTemplateByName(name) {
    return await this.emailTemplateRepository.findByName(name);
  }

  /**
   * Create template
   */
  async createTemplate(dto) {
    // Check if template with same name exists
    const existing = await this.emailTemplateRepository.findByName(dto.name);
    
    if (existing) {
      throw new ConflictError('Template with this name already exists');
    }

    const template = await this.emailTemplateRepository.create(dto);
    
    logger.info('Email template created', { 
      templateId: template._id,
      name: template.name 
    });

    return template;
  }

  /**
   * Update template
   */
  async updateTemplate(id, updates) {
    const template = await this.emailTemplateRepository.update(id, updates);
    
    logger.info('Email template updated', { templateId: id });

    return template;
  }

  /**
   * Delete template
   */
  async deleteTemplate(id) {
    await this.emailTemplateRepository.delete(id);
    
    logger.info('Email template deleted', { templateId: id });

    return { message: 'Email template deleted successfully' };
  }
}

module.exports = ManageEmailTemplatesUseCase;

