const ICategoryRepository = require('../../../../domain/repositories/ICategoryRepository');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { NotFoundError } = require('../../../../shared/errors/AppError');

/**
 * MongoDB Category Repository Implementation (Adapter)
 * Implements ICategoryRepository using Mongoose
 * @version 5.1.0
 */
class MongoCategoryRepository extends ICategoryRepository {
  async findById(id) {
    const category = await Category.findById(id).lean();
    if (!category) {
      throw new NotFoundError('Category');
    }
    return category;
  }

  async findBySlug(slug) {
    return await Category.findOne({ slug }).lean();
  }

  async findAll(options = {}) {
    const { sortBy = 'name', sortOrder = 'asc' } = options;
    
    return await Category.find()
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .lean();
  }

  async create(categoryData) {
    const category = await Category.create(categoryData);
    return category.toObject();
  }

  async update(id, updates) {
    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      throw new NotFoundError('Category');
    }
    
    return category.toObject();
  }

  async delete(id) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundError('Category');
    }
  }

  async countProducts(id) {
    return await Product.countDocuments({ category: id });
  }
}

module.exports = MongoCategoryRepository;

