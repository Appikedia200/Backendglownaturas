const { BadRequestError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const { ORDER_STATUS } = require('../../../shared/constants');

/**
 * Update Order Status Use Case
 * Updates order status with business rules
 * @version 5.1.0
 */
class UpdateOrderStatusUseCase {
  /**
   * @param {IOrderRepository} orderRepository
   * @param {IEmailService} emailService
   */
  constructor(orderRepository, emailService) {
    this.orderRepository = orderRepository;
    this.emailService = emailService;
  }

  /**
   * Execute use case
   * @param {string} orderId
   * @param {string} newStatus
   * @param {Object} additionalData
   * @returns {Promise<Order>}
   */
  async execute(orderId, newStatus, additionalData = {}) {
    // Find order
    const order = await this.orderRepository.findByOrderId(orderId);

    // Validate status transition
    this.validateStatusTransition(order.status, newStatus);

    // Prepare updates
    const updates = {
      status: newStatus,
      ...additionalData,
    };

    // Status-specific logic
    if (newStatus === ORDER_STATUS.SHIPPED && additionalData.trackingNumber) {
      updates.shipping = {
        carrier: additionalData.carrier,
        trackingNumber: additionalData.trackingNumber,
        trackingUrl: additionalData.trackingUrl,
      };
    }

    if (newStatus === ORDER_STATUS.DELIVERED) {
      updates.deliveredAt = new Date();
    }

    // Update order
    const updatedOrder = await this.orderRepository.update(order._id, updates);

    // Send status update email
    try {
      await this.emailService.sendOrderStatusUpdate(updatedOrder, newStatus);
    } catch (emailError) {
      logger.warn('Failed to send order status email', {
        orderId: updatedOrder._id,
        status: newStatus,
        error: emailError.message
      });
    }

    logger.info('Order status updated', {
      orderId: updatedOrder._id,
      orderNumber: updatedOrder.orderId,
      oldStatus: order.status,
      newStatus
    });

    return updatedOrder;
  }

  validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}

module.exports = UpdateOrderStatusUseCase;

