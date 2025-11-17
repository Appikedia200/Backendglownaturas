/**
 * Review Repository Interface (Port)
 * Defines contract for review data access
 * @interface
 * @version 5.1.0
 */
class IReviewRepository {
  /**
   * Find review by ID
   * @param {string} id
   * @returns {Promise<Review>}
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find all reviews with filters
   * @param {Object} filters
   * @param {Object} options
   * @returns {Promise<{reviews: Review[], total: number}>}
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Find reviews by product
   * @param {string} productId
   * @param {Object} options
   * @returns {Promise<{reviews: Review[], total: number}>}
   */
  async findByProduct(productId, options = {}) {
    throw new Error('Method not implemented: findByProduct');
  }

  /**
   * Update review status
   * @param {string} id
   * @param {string} status
   * @returns {Promise<Review>}
   */
  async updateStatus(id, status) {
    throw new Error('Method not implemented: updateStatus');
  }

  /**
   * Delete review
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Calculate average rating for product
   * @param {string} productId
   * @returns {Promise<number>}
   */
  async calculateAverageRating(productId) {
    throw new Error('Method not implemented: calculateAverageRating');
  }
}

module.exports = IReviewRepository;

