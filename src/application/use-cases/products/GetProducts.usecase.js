const Pagination = require('../../../shared/utils/Pagination');

/**
 * Get Products Use Case
 * Retrieves products with filters and pagination
 * @version 5.1.0
 */
class GetProductsUseCase {
  /**
   * @param {IProductRepository} productRepository
   */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /**
   * Execute use case - Get all products
   * @param {Object} query
   * @returns {Promise<{products: Product[], total: number, page: number, limit: number}>}
   */
  async execute(query) {
    const { page, limit, skip } = Pagination.parse(query);

    const filters = {};
    const options = {
      page,
      limit,
      search: query.search,
      category: query.category,
      status: query.status,
      featured: query.featured,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    };

    const { products, total } = await this.productRepository.findAll(filters, options);

    return {
      products,
      total,
      page,
      limit,
    };
  }

  /**
   * Execute use case - Get single product by ID
   * @param {string} id
   * @returns {Promise<Product>}
   */
  async executeById(id) {
    return await this.productRepository.findById(id);
  }

  /**
   * Execute use case - Get low stock products
   * @param {number} threshold
   * @returns {Promise<Product[]>}
   */
  async executeLowStock(threshold = 10) {
    return await this.productRepository.findLowStock(threshold);
  }
}

module.exports = GetProductsUseCase;

