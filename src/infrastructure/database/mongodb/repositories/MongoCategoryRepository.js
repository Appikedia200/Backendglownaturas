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
    const category = await Category.findById(id).populate('image', 'cloudinaryUrl');
    if (!category) {
      throw new NotFoundError('Category');
    }
    return this._transformCategory(category);
  }

  async findBySlug(slug) {
    const category = await Category.findOne({ slug }).populate('image', 'cloudinaryUrl');
    return category ? this._transformCategory(category) : null;
  }

  async findAll(options = {}) {
    const { sortBy = 'name', sortOrder = 'asc' } = options;

    const categories = await Category.find()
      .populate('image', 'cloudinaryUrl')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    return categories.map(cat => this._transformCategory(cat));
  }

  /**
   * Transform category for frontend compatibility
   * @private
   */
  _transformCategory(category) {
    if (!category) return null;

    const catObj = category.toObject ? category.toObject() : category;

    // Transform image ObjectId reference to URL string
    if (catObj.image && typeof catObj.image === 'object') {
      catObj.image = catObj.image.cloudinaryUrl || '';
    } else if (!catObj.image) {
      catObj.image = '';
    }

    return catObj;
  }

  async create(categoryData) {
    const category = await Category.create(categoryData);
    const populated = await Category.findById(category._id).populate('image', 'cloudinaryUrl');
    return this._transformCategory(populated);
  }

  async update(id, updates) {
    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('image', 'cloudinaryUrl');

    if (!category) {
      throw new NotFoundError('Category');
    }

    return this._transformCategory(category);
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

