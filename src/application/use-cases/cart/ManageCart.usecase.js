/**
 * Manage Cart Use Case
 * Handles all cart operations business logic
 * @version 5.1.0
 */

const { ValidationError, NotFoundError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

class ManageCartUseCase {
  /**
   * @param {ICartRepository} cartRepository
   * @param {IProductRepository} productRepository
   */
  constructor(cartRepository, productRepository) {
    this.cartRepository = cartRepository;
    this.productRepository = productRepository;
  }

  /**
   * Get cart by session ID
   */
  async getCart(sessionId) {
    let cart = await this.cartRepository.findBySessionId(sessionId);
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await this.cartRepository.create({
        sessionId,
        items: []
      });
    }
    
    return cart;
  }

  /**
   * Add item to cart
   */
  async addItem(sessionId, productId, quantity, customerEmail) {
    // Validate product exists and is available
    const product = await this.productRepository.findById(productId);
    
    if (product.status !== 'active') {
      throw new ValidationError('Product is not available');
    }

    // Check stock availability
    const availableStock = product.stock - product.reservedStock;
    if (availableStock < quantity) {
      throw new ValidationError(
        `Insufficient stock. Only ${availableStock} units available`
      );
    }

    // Get or create cart
    let cart = await this.cartRepository.findBySessionId(sessionId);
    
    if (!cart) {
      cart = await this.cartRepository.create({
        sessionId,
        customerEmail,
        items: [{
          product: productId,
          quantity,
          priceAtAdd: product.price
        }]
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(
        item => item.product._id.toString() === productId
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        if (availableStock < newQuantity) {
          throw new ValidationError(
            `Cannot add ${quantity} more units. Only ${availableStock} units available`
          );
        }
        
        await this.cartRepository.updateItemQuantity(sessionId, productId, newQuantity);
      } else {
        await this.cartRepository.addItem(sessionId, {
          product: productId,
          quantity,
          priceAtAdd: product.price
        });
      }
      
      cart = await this.cartRepository.findBySessionId(sessionId);
    }

    logger.info('Item added to cart', { sessionId, productId, quantity });
    
    return cart;
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(sessionId, productId, quantity) {
    if (quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    // Validate stock availability
    const product = await this.productRepository.findById(productId);
    const availableStock = product.stock - product.reservedStock;
    
    if (availableStock < quantity) {
      throw new ValidationError(
        `Insufficient stock. Only ${availableStock} units available`
      );
    }

    const cart = await this.cartRepository.updateItemQuantity(sessionId, productId, quantity);
    
    logger.info('Cart item quantity updated', { sessionId, productId, quantity });
    
    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeItem(sessionId, productId) {
    const cart = await this.cartRepository.removeItem(sessionId, productId);
    
    logger.info('Item removed from cart', { sessionId, productId });
    
    return cart;
  }

  /**
   * Clear cart
   */
  async clearCart(sessionId) {
    const cart = await this.cartRepository.clear(sessionId);
    
    logger.info('Cart cleared', { sessionId });
    
    return cart;
  }
}

module.exports = ManageCartUseCase;

