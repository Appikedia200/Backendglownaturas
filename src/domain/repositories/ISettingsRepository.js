/**
 * Settings Repository Interface (Port)
 * Defines contract for site settings data access
 * @interface
 * @version 5.1.0
 */
class ISettingsRepository {
  /**
   * Get site settings
   * @returns {Promise<Settings>}
   */
  async get() {
    throw new Error('Method not implemented');
  }

  /**
   * Update site settings
   * @param {Object} updates
   * @returns {Promise<Settings>}
   */
  async update(updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Initialize default settings
   * @returns {Promise<Settings>}
   */
  async initialize() {
    throw new Error('Method not implemented');
  }
}

module.exports = ISettingsRepository;

