const { ValidationError, BadRequestError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');
const mongoose = require('mongoose');

/**
 * Create Order Use Case
 * Orchestrates order creation with atomic stock management
 * @version 5.1.0
 */
class CreateOrderUseCase {
  /**
   * @param {IOrderRepository} orderRepository
   * @param {IProductRepository} productRepository
   * @param {IEmailService} emailService
   */
  constructor(orderRepository, productRepository, emailService) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.emailService = emailService;
  }

  /**
   * Execute use case
   * @param {Object} dto
   * @returns {Promise<Order>}
   */
  async execute(dto) {
    const session = await mongoose.startSession();
    
    try {
      await session.startTransaction();

      // Validate and prepare order items
      const orderItems = await this.validateAndPrepareItems(dto.items, session);

      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const shippingFee = dto.shippingFee || 0;
      const total = subtotal + shippingFee;

      // Generate order ID
      const orderId = this.generateOrderId();

      // Create order data
      const orderData = {
        orderId,
        customer: dto.customer,
        items: orderItems,
        subtotal,
        shippingFee,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: dto.paymentMethod,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      // Create order
      const order = await this.orderRepository.create(orderData);

      await session.commitTransaction();

      // Send confirmation email (outside transaction)
      try {
        await this.emailService.sendOrderConfirmation(order);
      } catch (emailError) {
        logger.warn('Failed to send order confirmation email', {
          orderId: order._id,
          error: emailError.message
        });
      }

      logger.info('Order created', {
        orderId: order._id,
        orderNumber: order.orderId,
        total: order.total
      });

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async validateAndPrepareItems(items, session) {
    const orderItems = [];

    for (const item of items) {
      // Fetch product
      const product = await this.productRepository.findById(item.product);

      // Check stock availability
      if (product.trackInventory && product.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      // Reserve stock
      if (product.trackInventory) {
        await this.productRepository.updateStock(item.product, -item.quantity);
      }

      // Prepare order item
      orderItems.push({
        product: product._id,
        productName: product.name,
        productSKU: product.sku,
        quantity: item.quantity,
        price: product.salePrice || product.price,
        subtotal: (product.salePrice || product.price) * item.quantity,
      });
    }

    return orderItems;
  }

  generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${timestamp}${random}`;
  }
}

module.exports = CreateOrderUseCase;

