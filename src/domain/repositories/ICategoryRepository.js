/**
 * Category Repository Interface (Port)
 * Defines contract for category data access
 * @interface
 * @version 5.1.0
 */
class ICategoryRepository {
  /**
   * Find category by ID
   * @param {string} id
   * @returns {Promise<Category>}
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find category by slug
   * @param {string} slug
   * @returns {Promise<Category|null>}
   */
  async findBySlug(slug) {
    throw new Error('Method not implemented: findBySlug');
  }

  /**
   * Find all categories
   * @param {Object} options
   * @returns {Promise<Category[]>}
   */
  async findAll(options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Create new category
   * @param {Object} categoryData
   * @returns {Promise<Category>}
   */
  async create(categoryData) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Update category
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Category>}
   */
  async update(id, updates) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Delete category
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Count products in category
   * @param {string} id
   * @returns {Promise<number>}
   */
  async countProducts(id) {
    throw new Error('Method not implemented: countProducts');
  }
}

module.exports = ICategoryRepository;

