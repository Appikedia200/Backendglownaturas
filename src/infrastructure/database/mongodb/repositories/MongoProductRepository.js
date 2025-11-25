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
      // Jewelry-specific filters
      jewelryMaterial,
      jewelryPurity,
      jewelryType,
      jewelryGender,
      stoneType,
      minPrice,
      maxPrice,
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

    // Jewelry-specific filters
    if (jewelryMaterial) {
      query['jewelry.material'] = jewelryMaterial;
    }

    if (jewelryPurity) {
      query['jewelry.purity'] = jewelryPurity;
    }

    if (jewelryType) {
      query['jewelry.type'] = jewelryType;
    }

    if (jewelryGender) {
      query['jewelry.gender'] = jewelryGender;
    }

    if (stoneType) {
      query['jewelry.stone.type'] = stoneType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
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

  /**
   * Get available jewelry filter options
   * @returns {Promise<Object>}
   */
  async getJewelryFilters() {
    const filters = await Product.aggregate([
      { $match: { 'jewelry': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          materials: { $addToSet: '$jewelry.material' },
          purities: { $addToSet: '$jewelry.purity' },
          types: { $addToSet: '$jewelry.type' },
          genders: { $addToSet: '$jewelry.gender' },
          stoneTypes: { $addToSet: '$jewelry.stone.type' }
        }
      }
    ]);

    return filters[0] || {
      materials: [],
      purities: [],
      types: [],
      genders: [],
      stoneTypes: []
    };
  }

  /**
   * Count products with optional filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    return await Product.countDocuments(filter);
  }

  /**
   * Count products with low stock
   * @param {number} threshold - Stock threshold
   * @returns {Promise<number>}
   */
  async countLowStock(threshold = 10) {
    return await Product.countDocuments({
      stock: { $lte: threshold },
      trackInventory: true,
      status: 'active'
    });
  }
}

module.exports = MongoProductRepository;

