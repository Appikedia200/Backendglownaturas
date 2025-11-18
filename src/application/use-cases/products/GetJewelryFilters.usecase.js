/**
 * Get Jewelry Filters Use Case
 * Retrieves available jewelry filter options from existing products
 * @version 5.1.0
 */

const logger = require('../../../config/logger');

class GetJewelryFiltersUseCase {
  /**
   * @param {IProductRepository} productRepository
   */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /**
   * Execute use case - Get available jewelry filter options
   * @returns {Promise<Object>}
   */
  async execute() {
    const filters = await this.productRepository.getJewelryFilters();
    
    logger.info('Retrieved jewelry filters');
    
    return filters;
  }
}

module.exports = GetJewelryFiltersUseCase;

