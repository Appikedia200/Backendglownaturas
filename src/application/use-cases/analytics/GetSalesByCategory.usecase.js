/**
 * Get Sales By Category Use Case
 * Returns sales breakdown by product category
 * @version 5.2.1
 */

const logger = require('../../../config/logger');
const { ValidationError } = require('../../../shared/errors/AppError');

class GetSalesByCategoryUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(options = {}) {
    const { startDate, endDate } = options;

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

    const salesByCategory = await this.orderRepository.getSalesByCategory(dateFilter);

    logger.info('Sales by category retrieved', { categories: salesByCategory.length });

    return salesByCategory;
  }
}

module.exports = GetSalesByCategoryUseCase;

