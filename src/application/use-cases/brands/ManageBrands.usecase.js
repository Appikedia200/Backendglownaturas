/**
 * Manage Brands Use Case
 * Handles all brand-related business logic
 * @version 5.2.1
 */

const logger = require('../../../config/logger');
const { ValidationError } = require('../../../shared/errors/AppError');

class ManageBrandsUseCase {
  constructor(brandRepository) {
    this.brandRepository = brandRepository;
  }

  /**
   * Get all brands with optional filtering and pagination
   */
  async getAllBrands(options = {}) {
    try {
      const result = await this.brandRepository.findAll({}, options);
      
      // Group brands by first letter for frontend A-Z navigation
      const brandsByLetter = result.brands.reduce((acc, brand) => {
        const letter = brand.firstLetter || '#';
        if (!acc[letter]) {
          acc[letter] = [];
        }
        acc[letter].push(brand);
        return acc;
      }, {});

      logger.info('Retrieved brands', {
        total: result.total,
        page: result.page,
        lettersCount: Object.keys(brandsByLetter).length
      });

      return {
        brands: result.brands,
        brandsByLetter,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      };
    } catch (error) {
      logger.error('Failed to get brands', { error: error.message });
      throw error;
    }
  }

  /**
   * Get single brand by slug
   */
  async getBrandBySlug(slug) {
    if (!slug) {
      throw new ValidationError('Brand slug is required');
    }

    try {
      const brand = await this.brandRepository.findBySlug(slug);
      logger.info('Retrieved brand by slug', { slug, brandId: brand._id });
      return brand;
    } catch (error) {
      logger.error('Failed to get brand by slug', { slug, error: error.message });
      throw error;
    }
  }

  /**
   * Get brands by first letter (A-Z or #)
   */
  async getBrandsByLetter(letter) {
    if (!letter) {
      throw new ValidationError('Letter is required');
    }

    try {
      const brands = await this.brandRepository.findByLetter(letter);
      logger.info('Retrieved brands by letter', { letter, count: brands.length });
      return brands;
    } catch (error) {
      logger.error('Failed to get brands by letter', { letter, error: error.message });
      throw error;
    }
  }

  /**
   * Create new brand (Admin only)
   */
  async createBrand(brandData) {
    if (!brandData.name) {
      throw new ValidationError('Brand name is required');
    }

    try {
      const brand = await this.brandRepository.create(brandData);
      logger.info('Brand created', { brandId: brand._id, name: brand.name });
      return brand;
    } catch (error) {
      logger.error('Failed to create brand', { error: error.message });
      throw error;
    }
  }

  /**
   * Update brand (Admin only)
   */
  async updateBrand(id, updates) {
    if (!id) {
      throw new ValidationError('Brand ID is required');
    }

    try {
      const brand = await this.brandRepository.update(id, updates);
      logger.info('Brand updated', { brandId: id, updates });
      return brand;
    } catch (error) {
      logger.error('Failed to update brand', { brandId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Delete brand (Admin only)
   */
  async deleteBrand(id) {
    if (!id) {
      throw new ValidationError('Brand ID is required');
    }

    try {
      await this.brandRepository.delete(id);
      logger.info('Brand deleted', { brandId: id });
    } catch (error) {
      logger.error('Failed to delete brand', { brandId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Sync brands from products (Admin only, one-time or periodic)
   */
  async syncBrandsFromProducts() {
    try {
      const result = await this.brandRepository.syncFromProducts();
      logger.info('Brands synced from products', result);
      return {
        message: `Brands synced successfully: ${result.created} created, ${result.updated} updated`,
        ...result
      };
    } catch (error) {
      logger.error('Failed to sync brands', { error: error.message });
      throw error;
    }
  }
}

module.exports = ManageBrandsUseCase;

