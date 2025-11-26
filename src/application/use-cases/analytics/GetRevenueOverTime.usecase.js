/**
 * Get Revenue Over Time Use Case
 * Provides revenue trends grouped by day, week, or month
 * @version 5.2.1
 */

const logger = require('../../../config/logger');
const { ValidationError } = require('../../../shared/errors/AppError');

class GetRevenueOverTimeUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(options = {}) {
    const { startDate, endDate, groupBy = 'day' } = options;

    // Validate inputs
    if (!['day', 'week', 'month'].includes(groupBy)) {
      throw new ValidationError('groupBy must be day, week, or month');
    }

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

    const revenueData = await this.orderRepository.getRevenueOverTime(dateFilter, groupBy);

    logger.info('Revenue over time retrieved', { groupBy, records: revenueData.length });

    return revenueData;
  }
}

module.exports = GetRevenueOverTimeUseCase;

