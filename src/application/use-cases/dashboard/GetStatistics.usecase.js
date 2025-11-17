/**
 * Get Dashboard Statistics Use Case
 * Handles dashboard analytics business logic
 * @version 5.1.0
 */

const logger = require('../../../config/logger');

class GetStatisticsUseCase {
  /**
   * @param {IOrderRepository} orderRepository
   * @param {IProductRepository} productRepository
   * @param {ICategoryRepository} categoryRepository
   * @param {IReviewRepository} reviewRepository
   */
  constructor(orderRepository, productRepository, categoryRepository, reviewRepository) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.reviewRepository = reviewRepository;
  }

  /**
   * Get dashboard statistics
   */
  async execute(options = {}) {
    const { startDate, endDate } = options;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get all statistics in parallel
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalProducts,
      lowStockProducts,
      totalCategories,
      pendingReviews,
      recentOrders
    ] = await Promise.all([
      this.orderRepository.count(dateFilter),
      this.orderRepository.getTotalRevenue(dateFilter),
      this.orderRepository.countByStatus('pending'),
      this.orderRepository.countByStatus('delivered'),
      this.productRepository.count({}),
      this.productRepository.countLowStock(10),
      this.categoryRepository.count({}),
      this.reviewRepository.countByStatus('pending'),
      this.orderRepository.findAll({ createdAt: dateFilter }, { limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
    ]);

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statistics = {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        recent: recentOrders.orders
      },
      revenue: {
        total: totalRevenue,
        average: averageOrderValue
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      categories: {
        total: totalCategories
      },
      reviews: {
        pending: pendingReviews
      }
    };

    logger.info('Dashboard statistics retrieved');

    return statistics;
  }
}

module.exports = GetStatisticsUseCase;

