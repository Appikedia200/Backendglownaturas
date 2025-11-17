/**
 * Order Repository Interface (Port)
 * Defines contract for order data access
 * @interface
 * @version 5.1.0
 */
class IOrderRepository {
  /**
   * Find order by ID
   * @param {string} id
   * @returns {Promise<Order>}
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find order by Order ID
   * @param {string} orderId
   * @returns {Promise<Order>}
   */
  async findByOrderId(orderId) {
    throw new Error('Method not implemented: findByOrderId');
  }

  /**
   * Find all orders with filters
   * @param {Object} filters
   * @param {Object} options
   * @returns {Promise<{orders: Order[], total: number}>}
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Create new order
   * @param {Object} orderData
   * @returns {Promise<Order>}
   */
  async create(orderData) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Update order
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Order>}
   */
  async update(id, updates) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Update order status
   * @param {string} id
   * @param {string} status
   * @returns {Promise<Order>}
   */
  async updateStatus(id, status) {
    throw new Error('Method not implemented: updateStatus');
  }

  /**
   * Update payment status
   * @param {string} id
   * @param {string} paymentStatus
   * @returns {Promise<Order>}
   */
  async updatePaymentStatus(id, paymentStatus) {
    throw new Error('Method not implemented: updatePaymentStatus');
  }

  /**
   * Add note to order
   * @param {string} id
   * @param {Object} note
   * @returns {Promise<Order>}
   */
  async addNote(id, note) {
    throw new Error('Method not implemented: addNote');
  }

  /**
   * Find expired orders
   * @returns {Promise<Order[]>}
   */
  async findExpired() {
    throw new Error('Method not implemented: findExpired');
  }

  /**
   * Get order statistics
   * @returns {Promise<Object>}
   */
  async getStatistics() {
    throw new Error('Method not implemented: getStatistics');
  }
}

module.exports = IOrderRepository;

