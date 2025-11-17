const IProductRepository = require('../../../../domain/repositories/IProductRepository');
const Product = require('../models/Product');
const { NotFoundError } = require('../../../../shared/errors/AppError');

/**
 * MongoDB Product Repository Implementation (Adapter)
 * Implements IProductRepository using Mongoose
 * @version 5.1.0
 */
class MongoProductRepository extends IProductRepository {
  async findById(id) {
    const product = await Product.findById(id).populate('category');
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async findBySku(sku) {
    return await Product.findOne({ sku });
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.featured = featured;
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return { products, total };
  }

  async create(productData) {
    const product = await Product.create(productData);
    return await product.populate('category');
  }

  async update(id, updates) {
    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('category');
    
    if (!product) {
      throw new NotFoundError('Product');
    }
    
    return product;
  }

  async delete(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError('Product');
    }
  }

  async bulkUpdateStatus(ids, status) {
    await Product.updateMany(
      { _id: { $in: ids } },
      { status }
    );
  }

  async findLowStock(threshold = 10) {
    return await Product.find({
      stock: { $lte: threshold },
      trackInventory: true,
      status: 'published',
    })
      .populate('category')
      .lean();
  }

  async updateStock(id, quantity) {
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { new: true, runValidators: true }
    ).populate('category');
    
    if (!product) {
      throw new NotFoundError('Product');
    }
    
    return product;
  }
}

module.exports = MongoProductRepository;

