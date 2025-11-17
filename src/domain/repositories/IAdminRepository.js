/**
 * Admin Repository Interface (Port)
 * Defines contract for admin/authentication data access
 * @interface
 * @version 5.1.0
 */
class IAdminRepository {
  /**
   * Find admin by email
   * @param {string} email
   * @returns {Promise<Admin>}
   */
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  /**
   * Find admin by ID
   * @param {string} id
   * @returns {Promise<Admin>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Create new admin
   * @param {Object} adminData
   * @returns {Promise<Admin>}
   */
  async create(adminData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update admin
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Admin>}
   */
  async update(id, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Find admin by reset token
   * @param {string} token
   * @returns {Promise<Admin>}
   */
  async findByResetToken(token) {
    throw new Error('Method not implemented');
  }

  /**
   * Find admin by verification code
   * @param {string} email
   * @param {string} code
   * @returns {Promise<Admin>}
   */
  async findByVerificationCode(email, code) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all admins
   * @param {Object} filters
   * @returns {Promise<Admin[]>}
   */
  async findAll(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete admin
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = IAdminRepository;

