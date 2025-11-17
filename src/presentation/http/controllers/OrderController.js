const Response = require('../../../shared/utils/Response');

/**
 * Order HTTP Controller
 * Handles HTTP concerns ONLY - no business logic
 * @version 5.1.0
 */
class OrderController {
  /**
   * @param {CreateOrderUseCase} createOrderUseCase
   * @param {ConfirmPaymentUseCase} confirmPaymentUseCase
   * @param {UpdateOrderStatusUseCase} updateOrderStatusUseCase
   * @param {GetOrdersUseCase} getOrdersUseCase
   */
  constructor(createOrderUseCase, confirmPaymentUseCase, updateOrderStatusUseCase, getOrdersUseCase) {
    this.createOrderUseCase = createOrderUseCase;
    this.confirmPaymentUseCase = confirmPaymentUseCase;
    this.updateOrderStatusUseCase = updateOrderStatusUseCase;
    this.getOrdersUseCase = getOrdersUseCase;
  }

  /**
   * Create new order
   * POST /api/orders
   */
  async create(req, res, next) {
    try {
      const order = await this.createOrderUseCase.execute(req.body);
      res.status(201).json(Response.created(order));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders
   * GET /api/orders
   */
  async getAll(req, res, next) {
    try {
      const { orders, total, page, limit } = await this.getOrdersUseCase.execute(req.query);
      res.json(Response.paginated(orders, { total, page, limit }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single order
   * GET /api/orders/:orderId
   */
  async getOne(req, res, next) {
    try {
      const order = await this.getOrdersUseCase.executeByOrderId(req.params.orderId);
      res.json(Response.success(order));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment
   * POST /api/orders/:orderId/confirm-payment
   */
  async confirmPayment(req, res, next) {
    try {
      const order = await this.confirmPaymentUseCase.execute(req.params.orderId, req.body);
      res.json(Response.success(order));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   * PATCH /api/orders/:orderId/status
   */
  async updateStatus(req, res, next) {
    try {
      const order = await this.updateOrderStatusUseCase.execute(
        req.params.orderId,
        req.body.status,
        req.body
      );
      res.json(Response.success(order));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order statistics
   * GET /api/orders/statistics
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await this.getOrdersUseCase.executeStatistics();
      res.json(Response.success(stats));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;

