/**
 * Export Analytics Use Case
 * Exports analytics data in CSV or Excel format
 * @version 5.2.1
 */

const logger = require('../../../config/logger');
const { ValidationError } = require('../../../shared/errors/AppError');

class ExportAnalyticsUseCase {
  constructor(orderRepository, productRepository) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
  }

  async execute(options = {}) {
    const { startDate, endDate, type = 'orders' } = options;

    // Validate dates
    if (startDate && isNaN(new Date(startDate))) {
      throw new ValidationError('Invalid start date');
    }
    if (endDate && isNaN(new Date(endDate))) {
      throw new ValidationError('Invalid end date');
    }

    // Validate export type
    if (!['orders', 'products', 'revenue'].includes(type)) {
      throw new ValidationError('Export type must be orders, products, or revenue');
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    let data;

    switch (type) {
      case 'orders':
        data = await this.orderRepository.getOrdersForExport(dateFilter);
        break;
      case 'products':
        data = await this.productRepository.getProductsForExport();
        break;
      case 'revenue':
        data = await this.orderRepository.getRevenueForExport(dateFilter);
        break;
    }

    logger.info('Analytics export prepared', { type, records: data.length });

    return {
      type,
      data,
      dateRange: {
        from: startDate || null,
        to: endDate || null
      },
      exportedAt: new Date().toISOString()
    };
  }
}

module.exports = ExportAnalyticsUseCase;

