const logger = require('../../../config/logger');

/**
 * Delete Product Use Case
 * Orchestrates product deletion with business rules
 * @version 5.1.0
 */
class DeleteProductUseCase {
  /**
   * @param {IProductRepository} productRepository
   */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /**
   * Execute use case
   * @param {string} id
   * @returns {Promise<void>}
   */
  async execute(id) {
    // Verify product exists
    const product = await this.productRepository.findById(id);

    // Delete product
    await this.productRepository.delete(id);

    logger.info('Product deleted', {
      productId: id,
      sku: product.sku,
      name: product.name
    });
  }
}

module.exports = DeleteProductUseCase;

