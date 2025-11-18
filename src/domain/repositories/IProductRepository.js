/**
 * Product Repository Interface (Port)
 * Defines contract for product data access
 * @interface
 * @version 5.1.0
 */
class IProductRepository {
  /**
   * Find product by ID
   * @param {string} id
   * @returns {Promise<Product>}
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find product by SKU
   * @param {string} sku
   * @returns {Promise<Product|null>}
   */
  async findBySku(sku) {
    throw new Error('Method not implemented: findBySku');
  }

  /**
   * Find all products with filters
   * @param {Object} filters
   * @param {Object} options - Pagination and sorting
   * @returns {Promise<{products: Product[], total: number}>}
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Create new product
   * @param {Object} productData
   * @returns {Promise<Product>}
   */
  async create(productData) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Update product
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Product>}
   */
  async update(id, updates) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Delete product
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Bulk update product status
   * @param {string[]} ids
   * @param {string} status
   * @returns {Promise<void>}
   */
  async bulkUpdateStatus(ids, status) {
    throw new Error('Method not implemented: bulkUpdateStatus');
  }

  /**
   * Find low stock products
   * @param {number} threshold
   * @returns {Promise<Product[]>}
   */
  async findLowStock(threshold = 10) {
    throw new Error('Method not implemented: findLowStock');
  }

  /**
   * Update product stock
   * @param {string} id
   * @param {number} quantity
   * @returns {Promise<Product>}
   */
  async updateStock(id, quantity) {
    throw new Error('Method not implemented: updateStock');
  }

  /**
   * Get available jewelry filter options
   * @returns {Promise<Object>}
   */
  async getJewelryFilters() {
    throw new Error('Method not implemented: getJewelryFilters');
  }
}

module.exports = IProductRepository;

