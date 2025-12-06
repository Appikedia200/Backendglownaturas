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
      brand, // NEW: Support multiple brands
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
        { brand: { $regex: search, $options: 'i' } },
        { ingredients: { $elemMatch: { $regex: search, $options: 'i' } } }, // Search in ingredients array
      ];
    }
    
    // Support category by ObjectId OR slug (with hierarchical support)
    if (category) {
      const mongoose = require('mongoose');
      const Category = mongoose.model('Category');
      
      // Check if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(category) && /^[0-9a-fA-F]{24}$/.test(category)) {
        // Check if this category has subcategories
        const subcategories = await Category.find({ parentCategory: category }).select('_id');
        if (subcategories.length > 0) {
          // Parent category - include all subcategories
          query.category = { $in: [category, ...subcategories.map(sc => sc._id)] };
        } else {
          // Child category or category with no children - exact match
          query.category = category;
        }
      } else {
        // Treat as slug - lookup category
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          // Check if this category has subcategories
          const subcategories = await Category.find({ parentCategory: cat._id }).select('_id');
          if (subcategories.length > 0) {
            // Parent category - include all subcategories
            query.category = { $in: [cat._id, ...subcategories.map(sc => sc._id)] };
          } else {
            // Child category or category with no children - exact match
            query.category = cat._id;
          }
        } else {
          // Category slug not found - return empty results
          query.category = new mongoose.Types.ObjectId(); // Non-existent ID
        }
      }
    }
    
    // NEW: Support multiple brands (comma-separated)
    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      query.brand = { 
        $in: brands.map(b => new RegExp(`^${b}$`, 'i')) 
      };
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
        .skip((page - 1) * limit),
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

  /**
   * Calculate total inventory value (sum of price × stock for all products)
   * @returns {Promise<number>}
   */
  async getInventoryValue() {
    const result = await Product.aggregate([
      {
        $match: {
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: ['$price', '$stock']
            }
          }
        }
      }
    ]);
    
    return result[0]?.totalValue || 0;
  }

  /**
   * Get products data for export
   * @returns {Promise<Array>}
   */
  async getProductsForExport() {
    const products = await Product.find()
      .populate('category', 'name')
      .select('name sku price stock status category createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return products.map(product => ({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      status: product.status,
      category: product.category?.name || 'Uncategorized',
      inventoryValue: product.price * product.stock,
      createdAt: product.createdAt
    }));
  }
}

module.exports = MongoProductRepository;

