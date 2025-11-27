/**
 * Brand Repository Interface (Port)
 * Defines contract for brand data access
 * @interface
 * @version 5.2.1
 */
class IBrandRepository {
  /**
   * Find all brands
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} Brands list with pagination
   */
  async findAll(filters, options) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Find brand by ID
   * @param {string} id - Brand ID
   * @returns {Promise<Object>} Brand document
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find brand by slug
   * @param {string} slug - Brand slug
   * @returns {Promise<Object>} Brand document
   */
  async findBySlug(slug) {
    throw new Error('Method not implemented: findBySlug');
  }

  /**
   * Find brands by first letter
   * @param {string} letter - First letter (A-Z or #)
   * @returns {Promise<Array>} Brands starting with letter
   */
  async findByLetter(letter) {
    throw new Error('Method not implemented: findByLetter');
  }

  /**
   * Create brand
   * @param {Object} brandData - Brand data
   * @returns {Promise<Object>} Created brand
   */
  async create(brandData) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Update brand
   * @param {string} id - Brand ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated brand
   */
  async update(id, updates) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Delete brand
   * @param {string} id - Brand ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Sync brands from products
   * @returns {Promise<Object>} Sync result
   */
  async syncFromProducts() {
    throw new Error('Method not implemented: syncFromProducts');
  }
}

module.exports = IBrandRepository;

