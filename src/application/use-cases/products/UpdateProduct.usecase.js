const { ValidationError, ConflictError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

/**
 * Update Product Use Case
 * Orchestrates product updates with business rules
 * @version 5.1.0
 */
class UpdateProductUseCase {
  /**
   * @param {IProductRepository} productRepository
   * @param {ICategoryRepository} categoryRepository
   */
  constructor(productRepository, categoryRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  /**
   * Execute use case
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Product>}
   */
  async execute(id, updates) {
    // Validate business rules
    await this.validateBusinessRules(id, updates);

    // Update product
    const product = await this.productRepository.update(id, updates);

    logger.info('Product updated', {
      productId: product._id,
      sku: product.sku,
      updates: Object.keys(updates)
    });

    return product;
  }

  async validateBusinessRules(id, updates) {
    // Verify product exists
    await this.productRepository.findById(id);

    // Verify category if being updated
    if (updates.category) {
      await this.categoryRepository.findById(updates.category);
    }

    // Check for duplicate SKU if being updated
    if (updates.sku) {
      const existingProduct = await this.productRepository.findBySku(updates.sku);
      if (existingProduct && existingProduct._id.toString() !== id) {
        throw new ConflictError(`Product with SKU ${updates.sku} already exists`);
      }
    }

    // Validate pricing if being updated
    if (updates.price !== undefined || updates.salePrice !== undefined) {
      const currentProduct = await this.productRepository.findById(id);
      const newPrice = updates.price !== undefined ? updates.price : currentProduct.price;
      const newSalePrice = updates.salePrice !== undefined ? updates.salePrice : currentProduct.salePrice;

      if (newSalePrice && newSalePrice >= newPrice) {
        throw new ValidationError('Sale price must be less than regular price');
      }

      if (newPrice <= 0) {
        throw new ValidationError('Price must be greater than zero');
      }
    }

    // Validate stock if being updated
    if (updates.stock !== undefined && updates.stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }
  }
}

module.exports = UpdateProductUseCase;

