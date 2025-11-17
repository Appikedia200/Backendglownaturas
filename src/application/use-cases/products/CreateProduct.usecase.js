const { ValidationError, ConflictError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

/**
 * Create Product Use Case
 * Orchestrates product creation with business rules
 * @version 5.1.0
 */
class CreateProductUseCase {
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
   * @param {Object} dto
   * @returns {Promise<Product>}
   */
  async execute(dto) {
    // Validate business rules
    await this.validateBusinessRules(dto);

    // Create product
    const product = await this.productRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      salePrice: dto.salePrice,
      stock: dto.stock,
      sku: dto.sku,
      category: dto.category,
      images: dto.images || [],
      featured: dto.featured || false,
      status: dto.status || 'draft',
      seo: dto.seo || {},
      keywords: dto.keywords || [],
      trackInventory: dto.trackInventory !== false,
    });

    logger.info('Product created', {
      productId: product._id,
      sku: product.sku,
      name: product.name
    });

    return product;
  }

  async validateBusinessRules(dto) {
    // Verify category exists
    await this.categoryRepository.findById(dto.category);

    // Check for duplicate SKU
    const existingProduct = await this.productRepository.findBySku(dto.sku);
    if (existingProduct) {
      throw new ConflictError(`Product with SKU ${dto.sku} already exists`);
    }

    // Validate pricing
    if (dto.salePrice && dto.salePrice >= dto.price) {
      throw new ValidationError('Sale price must be less than regular price');
    }

    // Validate stock
    if (dto.stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    // Validate price
    if (dto.price <= 0) {
      throw new ValidationError('Price must be greater than zero');
    }
  }
}

module.exports = CreateProductUseCase;

