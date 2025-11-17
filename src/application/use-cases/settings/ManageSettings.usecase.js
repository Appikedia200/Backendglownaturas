/**
 * Manage Settings Use Case
 * Handles site settings business logic
 * @version 5.1.0
 */

const { ValidationError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

class ManageSettingsUseCase {
  /**
   * @param {ISettingsRepository} settingsRepository
   */
  constructor(settingsRepository) {
    this.settingsRepository = settingsRepository;
  }

  /**
   * Get site settings
   */
  async getSettings() {
    return await this.settingsRepository.get();
  }

  /**
   * Update site settings
   */
  async updateSettings(updates, updatedBy) {
    // Validate updates
    this.validateSettings(updates);

    const settings = await this.settingsRepository.update({
      ...updates,
      updatedBy,
      updatedAt: new Date()
    });

    logger.info('Settings updated', { updatedBy });

    return settings;
  }

  /**
   * Validate settings
   * @private
   */
  validateSettings(settings) {
    // Validate tax rate
    if (settings.taxRate !== undefined) {
      if (settings.taxRate < 0 || settings.taxRate > 100) {
        throw new ValidationError('Tax rate must be between 0 and 100');
      }
    }

    // Validate shipping fee
    if (settings.shippingFee !== undefined) {
      if (settings.shippingFee < 0) {
        throw new ValidationError('Shipping fee cannot be negative');
      }
    }

    // Validate free shipping threshold
    if (settings.freeShippingThreshold !== undefined) {
      if (settings.freeShippingThreshold < 0) {
        throw new ValidationError('Free shipping threshold cannot be negative');
      }
    }

    // Validate low stock threshold
    if (settings.lowStockThreshold !== undefined) {
      if (settings.lowStockThreshold < 0) {
        throw new ValidationError('Low stock threshold cannot be negative');
      }
    }
  }
}

module.exports = ManageSettingsUseCase;

