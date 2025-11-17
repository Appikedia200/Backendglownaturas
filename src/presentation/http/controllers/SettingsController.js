/**
 * Settings HTTP Controller
 * Handles HTTP requests for settings - NO business logic
 * @version 5.1.0
 */

const Response = require('../../../shared/utils/Response');

class SettingsController {
  /**
   * @param {ManageSettingsUseCase} manageSettingsUseCase
   */
  constructor(manageSettingsUseCase) {
    this.manageSettingsUseCase = manageSettingsUseCase;
  }

  /**
   * Get settings
   * GET /api/settings
   */
  async getSettings(req, res, next) {
    try {
      const settings = await this.manageSettingsUseCase.getSettings();
      res.json(Response.success(settings));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update settings
   * PUT /api/settings
   */
  async updateSettings(req, res, next) {
    try {
      const updatedBy = req.admin.id;
      const settings = await this.manageSettingsUseCase.updateSettings(req.body, updatedBy);
      res.json(Response.success(settings));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingsController;

