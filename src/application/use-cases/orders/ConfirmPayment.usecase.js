const { BadRequestError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const mongoose = require('mongoose');

/**
 * Confirm Payment Use Case
 * Processes payment confirmation for orders
 * @version 5.1.0
 */
class ConfirmPaymentUseCase {
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
   * @param {Object} paymentData
   * @returns {Promise<Order>}
   */
  async execute(orderId, paymentData) {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Find order
      const order = await this.orderRepository.findByOrderId(orderId);

      // Validate order status
      if (order.paymentStatus === 'paid') {
        throw new BadRequestError('Payment already confirmed for this order');
      }

      if (order.status === 'cancelled') {
        throw new BadRequestError('Cannot confirm payment for cancelled order');
      }

      // Update order
      const updatedOrder = await this.orderRepository.update(order._id, {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentProof: paymentData.paymentProof,
        paymentConfirmedAt: new Date(),
      });

      await session.commitTransaction();

      // Send payment confirmation email
      try {
        await this.emailService.sendOrderStatusUpdate(updatedOrder, 'confirmed');
      } catch (emailError) {
        logger.warn('Failed to send payment confirmation email', {
          orderId: updatedOrder._id,
          error: emailError.message
        });
      }

      logger.info('Payment confirmed', {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderId
      });

      return updatedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = ConfirmPaymentUseCase;

