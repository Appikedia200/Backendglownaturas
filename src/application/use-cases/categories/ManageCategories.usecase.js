const { ConflictError, BadRequestError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

/**
 * Manage Categories Use Case
 * Handles all category operations
 * @version 5.1.0
 */
class ManageCategoriesUseCase {
  /**
   * @param {ICategoryRepository} categoryRepository
   */
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAll() {
    return await this.categoryRepository.findAll();
  }

  async getById(id) {
    return await this.categoryRepository.findById(id);
  }

  async create(dto) {
    // Check for duplicate slug
    const existing = await this.categoryRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictError(`Category with slug '${dto.slug}' already exists`);
    }

    const category = await this.categoryRepository.create(dto);

    logger.info('Category created', {
      categoryId: category._id,
      name: category.name
    });

    return category;
  }

  async update(id, updates) {
    // Check for duplicate slug if being updated
    if (updates.slug) {
      const existing = await this.categoryRepository.findBySlug(updates.slug);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError(`Category with slug '${updates.slug}' already exists`);
      }
    }

    const category = await this.categoryRepository.update(id, updates);

    logger.info('Category updated', {
      categoryId: category._id,
      updates: Object.keys(updates)
    });

    return category;
  }

  async delete(id) {
    // Check if category has products
    const productCount = await this.categoryRepository.countProducts(id);
    if (productCount > 0) {
      throw new BadRequestError(
        `Cannot delete category with ${productCount} products. Reassign products first.`
      );
    }

    await this.categoryRepository.delete(id);

    logger.info('Category deleted', { categoryId: id });
  }
}

module.exports = ManageCategoriesUseCase;

