/**
 * Manage Homepage Sections Use Case
 * Handles homepage section business logic
 * @version 5.2.0
 */

const { ValidationError, ConflictError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

class ManageHomepageSectionsUseCase {
  /**
   * @param {IHomepageSectionRepository} homepageSectionRepository
   * @param {IProductRepository} productRepository
   */
  constructor(homepageSectionRepository, productRepository) {
    this.homepageSectionRepository = homepageSectionRepository;
    this.productRepository = productRepository;
  }

  /**
   * Get all sections
   */
  async getAllSections(filters = {}) {
    return await this.homepageSectionRepository.findAll(filters);
  }

  /**
   * Get section by type
   */
  async getSectionByType(sectionType) {
    return await this.homepageSectionRepository.findByType(sectionType);
  }

  /**
   * Create section
   */
  async createSection(dto) {
    // Validate section type
    const validTypes = ['featured', 'new_arrivals', 'back_in_stock', 'trending', 'best_sellers'];
    if (!validTypes.includes(dto.sectionType)) {
      throw new ValidationError(`Section type must be one of: ${validTypes.join(', ')}`);
    }

    // Check if section already exists
    try {
      const existing = await this.homepageSectionRepository.findByType(dto.sectionType);
      if (existing) {
        throw new ConflictError(`Section '${dto.sectionType}' already exists`);
      }
    } catch (error) {
      // NotFoundError is expected, continue
      if (error.name !== 'NotFoundError') {
        throw error;
      }
    }

    // Validate products if provided
    if (dto.products && dto.products.length > 0) {
      await this.validateProducts(dto.products);
    }

    const section = await this.homepageSectionRepository.create(dto);
    
    logger.info('Homepage section created', {
      sectionType: section.sectionType,
      productsCount: section.products?.length || 0
    });

    return section;
  }

  /**
   * Update section
   */
  async updateSection(sectionType, updates) {
    // Validate products if provided
    if (updates.products && updates.products.length > 0) {
      await this.validateProducts(updates.products);
      
      // Enforce maxProducts limit
      const section = await this.homepageSectionRepository.findByType(sectionType);
      const maxProducts = updates.maxProducts || section.maxProducts || 8;
      
      if (updates.products.length > maxProducts) {
        throw new ValidationError(`Cannot add more than ${maxProducts} products to this section`);
      }
    }

    const section = await this.homepageSectionRepository.update(sectionType, updates);
    
    logger.info('Homepage section updated', {
      sectionType,
      productsCount: section.products?.length || 0
    });

    return section;
  }

  /**
   * Delete section
   */
  async deleteSection(sectionType) {
    await this.homepageSectionRepository.delete(sectionType);
    
    logger.info('Homepage section deleted', { sectionType });

    return { message: `Section '${sectionType}' deleted successfully` };
  }

  /**
   * Add products to section
   */
  async addProducts(sectionType, productIds) {
    const section = await this.homepageSectionRepository.findByType(sectionType);
    
    // Validate products
    await this.validateProducts(productIds);
    
    // Get current products
    const currentProductIds = section.products.map(p => p._id.toString());
    
    // Add new products (avoid duplicates)
    const newProductIds = productIds.filter(id => !currentProductIds.includes(id));
    const updatedProducts = [...currentProductIds, ...newProductIds];
    
    // Check maxProducts limit
    if (updatedProducts.length > section.maxProducts) {
      throw new ValidationError(
        `Cannot add products. Section limit is ${section.maxProducts} products. Current: ${currentProductIds.length}, Trying to add: ${productIds.length}`
      );
    }
    
    return await this.homepageSectionRepository.update(sectionType, {
      products: updatedProducts
    });
  }

  /**
   * Remove products from section
   */
  async removeProducts(sectionType, productIds) {
    const section = await this.homepageSectionRepository.findByType(sectionType);
    
    // Remove specified products
    const currentProductIds = section.products.map(p => p._id.toString());
    const updatedProducts = currentProductIds.filter(id => !productIds.includes(id));
    
    return await this.homepageSectionRepository.update(sectionType, {
      products: updatedProducts
    });
  }

  /**
   * Reorder products in section
   */
  async reorderProducts(sectionType, productIds) {
    const section = await this.homepageSectionRepository.findByType(sectionType);
    
    // Validate that all products exist in section
    const currentProductIds = section.products.map(p => p._id.toString());
    const hasAllProducts = productIds.every(id => currentProductIds.includes(id));
    
    if (!hasAllProducts) {
      throw new ValidationError('Can only reorder products that are already in the section');
    }
    
    if (productIds.length !== currentProductIds.length) {
      throw new ValidationError('Must provide all product IDs when reordering');
    }
    
    return await this.homepageSectionRepository.update(sectionType, {
      products: productIds
    });
  }

  /**
   * Toggle section active status
   */
  async toggleActive(sectionType) {
    const section = await this.homepageSectionRepository.findByType(sectionType);
    
    return await this.homepageSectionRepository.update(sectionType, {
      isActive: !section.isActive
    });
  }

  /**
   * Validate products exist and are active
   * @private
   */
  async validateProducts(productIds) {
    for (const productId of productIds) {
      try {
        const product = await this.productRepository.findById(productId);
        
        if (product.status !== 'active') {
          logger.warn('Attempting to add inactive product to homepage section', {
            productId,
            status: product.status
          });
        }
      } catch (error) {
        throw new ValidationError(`Product with ID ${productId} not found`);
      }
    }
  }
}

module.exports = ManageHomepageSectionsUseCase;

