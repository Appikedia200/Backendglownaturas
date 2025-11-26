/**
 * Get Top Products Use Case
 * Returns best-selling products for analytics
 * @version 5.2.1
 */

const logger = require('../../../config/logger');
const { ValidationError } = require('../../../shared/errors/AppError');

class GetTopProductsUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(options = {}) {
    const { startDate, endDate, limit = 5 } = options;

    // Validate dates
    if (startDate && isNaN(new Date(startDate))) {
      throw new ValidationError('Invalid start date');
    }
    if (endDate && isNaN(new Date(endDate))) {
      throw new ValidationError('Invalid end date');
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const topProducts = await this.orderRepository.getTopProducts(dateFilter, limit);

    logger.info('Top products retrieved', { count: topProducts.length, limit });

    return topProducts;
  }
}

module.exports = GetTopProductsUseCase;

