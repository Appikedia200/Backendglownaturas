const Pagination = require('../../../shared/utils/Pagination');
const logger = require('../../../config/logger');

/**
 * Manage Reviews Use Case
 * Handles all review operations
 * @version 5.1.0
 */
class ManageReviewsUseCase {
  /**
   * @param {IReviewRepository} reviewRepository
   */
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async getAll(query) {
    const { page, limit } = Pagination.parse(query);

    const filters = {};
    const options = {
      page,
      limit,
      status: query.status,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    };

    const { reviews, total } = await this.reviewRepository.findAll(filters, options);

    return {
      reviews,
      total,
      page,
      limit,
    };
  }

  async getById(id) {
    return await this.reviewRepository.findById(id);
  }

  async getByProduct(productId, query) {
    const { page, limit } = Pagination.parse(query);
    const { reviews, total } = await this.reviewRepository.findByProduct(productId, {
      page,
      limit,
      status: query.status || 'approved',
    });

    return { reviews, total, page, limit };
  }

  async updateStatus(id, status) {
    const review = await this.reviewRepository.updateStatus(id, status);

    logger.info('Review status updated', {
      reviewId: id,
      status
    });

    return review;
  }

  async delete(id) {
    await this.reviewRepository.delete(id);

    logger.info('Review deleted', { reviewId: id });
  }
}

module.exports = ManageReviewsUseCase;

