/**
 * Email Template HTTP Controller
 * Handles HTTP requests for email templates - NO business logic
 * @version 5.1.0
 */

const Response = require('../../../shared/utils/Response');

class EmailTemplateController {
  /**
   * @param {ManageEmailTemplatesUseCase} manageEmailTemplatesUseCase
   * @param {IEmailService} emailService
   */
  constructor(manageEmailTemplatesUseCase, emailService, defaultTemplates) {
    this.manageEmailTemplatesUseCase = manageEmailTemplatesUseCase;
    this.emailService = emailService;
    this.defaultTemplates = defaultTemplates;
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
   * Get template by ID or templateType
   * GET /api/email-templates/:id
   */
  async getOne(req, res, next) {
    try {
      const { id } = req.params;

      // Check if it's a MongoDB ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

      let template;
      if (isObjectId) {
        // Fetch by ID
        template = await this.manageEmailTemplatesUseCase.getTemplateById(id);
      } else {
        // Fetch by templateType (e.g., "order_shipped_courier")
        template = await this.manageEmailTemplatesUseCase.getTemplateByType(id);
      }

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
   * Update template by ID or templateType
   * PUT /api/email-templates/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Check if it's a MongoDB ObjectId
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

      let template;
      if (isObjectId) {
        // Update by ID
        template = await this.manageEmailTemplatesUseCase.updateTemplate(id, req.body);
      } else {
        // Update by templateType
        template = await this.manageEmailTemplatesUseCase.updateTemplateByType(id, req.body);
      }

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

  /**
   * Preview template with sample data
   * POST /api/email-templates/preview
   */
  async preview(req, res, next) {
    try {
      const { type, sampleData } = req.body;
      const preview = await this.manageEmailTemplatesUseCase.previewTemplate(type, sampleData);
      res.json(Response.success(preview));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send test email
   * POST /api/email-templates/test-send
   */
  async testSend(req, res, next) {
    try {
      const { type, to, sampleData } = req.body;
      const result = await this.manageEmailTemplatesUseCase.sendTestEmail(
        type,
        to,
        sampleData,
        this.emailService
      );
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore template to default
   * POST /api/email-templates/:type/restore
   */
  async restore(req, res, next) {
    try {
      const { type } = req.params;
      const template = await this.manageEmailTemplatesUseCase.restoreToDefault(
        type,
        this.defaultTemplates
      );
      res.json(Response.success(template));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmailTemplateController;

