/**
 * Get Analytics Summary Use Case
 * Provides comprehensive analytics summary for date range
 * @version 5.2.1
 */

const logger = require('../../../config/logger');
const { ValidationError } = require('../../../shared/errors/AppError');

class GetAnalyticsSummaryUseCase {
  constructor(orderRepository, productRepository) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
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
      end.setHours(23, 59, 59, 999); // End of day
      dateFilter.$lte = end;
    }

    // Get analytics in parallel
    const [
      totalOrders,
      totalRevenue,
      paidOrders,
      pendingOrders,
      averageOrderValue,
      totalItemsSold
    ] = await Promise.all([
      this.orderRepository.count(dateFilter),
      this.orderRepository.getTotalRevenue(dateFilter),
      this.orderRepository.countByPaymentStatus('paid', dateFilter),
      this.orderRepository.countByPaymentStatus('pending', dateFilter),
      this.orderRepository.getAverageOrderValue(dateFilter),
      this.orderRepository.getTotalItemsSold(dateFilter)
    ]);

    const summary = {
      totalOrders,
      totalRevenue,
      paidOrders,
      pendingOrders,
      averageOrderValue,
      totalItemsSold,
      dateRange: {
        from: startDate || null,
        to: endDate || null
      }
    };

    logger.info('Analytics summary retrieved', { dateRange: summary.dateRange });

    return summary;
  }
}

module.exports = GetAnalyticsSummaryUseCase;

