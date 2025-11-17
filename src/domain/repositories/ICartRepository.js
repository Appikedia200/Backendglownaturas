/**
 * Cart Repository Interface (Port)
 * Defines contract for cart data access
 * @interface
 * @version 5.1.0
 */
class ICartRepository {
  /**
   * Find cart by session ID
   * @param {string} sessionId
   * @returns {Promise<Cart>}
   */
  async findBySessionId(sessionId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find cart by customer email
   * @param {string} email
   * @returns {Promise<Cart[]>}
   */
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  /**
   * Create new cart
   * @param {Object} cartData
   * @returns {Promise<Cart>}
   */
  async create(cartData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update cart
   * @param {string} sessionId
   * @param {Object} updates
   * @returns {Promise<Cart>}
   */
  async update(sessionId, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete cart
   * @param {string} sessionId
   * @returns {Promise<void>}
   */
  async delete(sessionId) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete expired carts
   * @param {Date} expiryDate
   * @returns {Promise<number>}
   */
  async deleteExpired(expiryDate) {
    throw new Error('Method not implemented');
  }

  /**
   * Add item to cart
   * @param {string} sessionId
   * @param {Object} item
   * @returns {Promise<Cart>}
   */
  async addItem(sessionId, item) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove item from cart
   * @param {string} sessionId
   * @param {string} productId
   * @returns {Promise<Cart>}
   */
  async removeItem(sessionId, productId) {
    throw new Error('Method not implemented');
  }

  /**
   * Update item quantity
   * @param {string} sessionId
   * @param {string} productId
   * @param {number} quantity
   * @returns {Promise<Cart>}
   */
  async updateItemQuantity(sessionId, productId, quantity) {
    throw new Error('Method not implemented');
  }

  /**
   * Clear cart
   * @param {string} sessionId
   * @returns {Promise<Cart>}
   */
  async clear(sessionId) {
    throw new Error('Method not implemented');
  }
}

module.exports = ICartRepository;

