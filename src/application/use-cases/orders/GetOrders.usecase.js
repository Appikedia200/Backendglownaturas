const Pagination = require('../../../shared/utils/Pagination');

/**
 * Get Orders Use Case
 * Retrieves orders with filters and pagination
 * @version 5.1.0
 */
class GetOrdersUseCase {
  /**
   * @param {IOrderRepository} orderRepository
   */
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute use case - Get all orders
   * @param {Object} query
   * @returns {Promise<{orders: Order[], total: number, page: number, limit: number}>}
   */
  async execute(query) {
    const { page, limit } = Pagination.parse(query);

    const filters = {};
    const options = {
      page,
      limit,
      status: query.status,
      paymentStatus: query.paymentStatus,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    };

    const { orders, total } = await this.orderRepository.findAll(filters, options);

    return {
      orders,
      total,
      page,
      limit,
    };
  }

  /**
   * Execute use case - Get single order by ID
   * @param {string} orderId
   * @returns {Promise<Order>}
   */
  async executeByOrderId(orderId) {
    return await this.orderRepository.findByOrderId(orderId);
  }

  /**
   * Execute use case - Get order statistics
   * @returns {Promise<Object>}
   */
  async executeStatistics() {
    return await this.orderRepository.getStatistics();
  }
}

module.exports = GetOrdersUseCase;

