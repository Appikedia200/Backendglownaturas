/**
 * Email Template Repository Interface (Port)
 * Defines contract for email template data access
 * @interface
 * @version 5.1.0
 */
class IEmailTemplateRepository {
  /**
   * Find template by name
   * @param {string} name
   * @returns {Promise<EmailTemplate>}
   */
  async findByName(name) {
    throw new Error('Method not implemented');
  }

  /**
   * Find template by ID
   * @param {string} id
   * @returns {Promise<EmailTemplate>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all templates
   * @returns {Promise<EmailTemplate[]>}
   */
  async findAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Create template
   * @param {Object} templateData
   * @returns {Promise<EmailTemplate>}
   */
  async create(templateData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update template
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<EmailTemplate>}
   */
  async update(id, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete template
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = IEmailTemplateRepository;

