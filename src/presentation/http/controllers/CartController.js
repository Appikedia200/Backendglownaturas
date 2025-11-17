/**
 * Cart HTTP Controller
 * Handles HTTP requests for cart - NO business logic
 * @version 5.1.0
 */

const Response = require('../../../shared/utils/Response');

class CartController {
  /**
   * @param {ManageCartUseCase} manageCartUseCase
   */
  constructor(manageCartUseCase) {
    this.manageCartUseCase = manageCartUseCase;
  }

  /**
   * Get cart
   * GET /api/cart/:sessionId
   */
  async getCart(req, res, next) {
    try {
      const cart = await this.manageCartUseCase.getCart(req.params.sessionId);
      res.json(Response.success(cart));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   * POST /api/cart
   */
  async addItem(req, res, next) {
    try {
      const { sessionId, productId, quantity, customerEmail } = req.body;
      const cart = await this.manageCartUseCase.addItem(sessionId, productId, quantity, customerEmail);
      res.status(201).json(Response.created(cart));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update item quantity
   * PUT /api/cart/:sessionId/items/:productId
   */
  async updateItemQuantity(req, res, next) {
    try {
      const { sessionId, productId } = req.params;
      const { quantity } = req.body;
      const cart = await this.manageCartUseCase.updateItemQuantity(sessionId, productId, quantity);
      res.json(Response.success(cart));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/cart/:sessionId/items/:productId
   */
  async removeItem(req, res, next) {
    try {
      const { sessionId, productId } = req.params;
      const cart = await this.manageCartUseCase.removeItem(sessionId, productId);
      res.json(Response.success(cart));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear cart
   * DELETE /api/cart/:sessionId
   */
  async clearCart(req, res, next) {
    try {
      const cart = await this.manageCartUseCase.clearCart(req.params.sessionId);
      res.json(Response.success(cart));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartController;

