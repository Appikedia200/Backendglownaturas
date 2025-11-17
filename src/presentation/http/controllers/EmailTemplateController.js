/**
 * Email Template HTTP Controller
 * Handles HTTP requests for email templates - NO business logic
 * @version 5.1.0
 */

const Response = require('../../../shared/utils/Response');

class EmailTemplateController {
  /**
   * @param {ManageEmailTemplatesUseCase} manageEmailTemplatesUseCase
   */
  constructor(manageEmailTemplatesUseCase) {
    this.manageEmailTemplatesUseCase = manageEmailTemplatesUseCase;
  }

  /**
   * Get all templates
   * GET /api/email-templates
   */
  async getAll(req, res, next) {
    try {
      const templates = await this.manageEmailTemplatesUseCase.getAllTemplates();
      res.json(Response.success(templates));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get template by ID
   * GET /api/email-templates/:id
   */
  async getOne(req, res, next) {
    try {
      const template = await this.manageEmailTemplatesUseCase.getTemplateById(req.params.id);
      res.json(Response.success(template));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create template
   * POST /api/email-templates
   */
  async create(req, res, next) {
    try {
      const template = await this.manageEmailTemplatesUseCase.createTemplate(req.body);
      res.status(201).json(Response.created(template));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update template
   * PUT /api/email-templates/:id
   */
  async update(req, res, next) {
    try {
      const template = await this.manageEmailTemplatesUseCase.updateTemplate(req.params.id, req.body);
      res.json(Response.success(template));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete template
   * DELETE /api/email-templates/:id
   */
  async delete(req, res, next) {
    try {
      const result = await this.manageEmailTemplatesUseCase.deleteTemplate(req.params.id);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmailTemplateController;

