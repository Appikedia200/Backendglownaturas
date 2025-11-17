const Product = require('../infrastructure/database/mongodb/models/Product');
const Category = require('../infrastructure/database/mongodb/models/Category');
const { generateSKU } = require('../utils/skuGenerator');
const { getPaginationParams, buildSearchQuery } = require('../utils/helpers');

exports.generateSKU = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const sku = await generateSKU(categoryId);
    
    res.json({
      success: true,
      sku
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    req.body.createdBy = req.admin.id;
    const product = await Product.create(req.body);
    
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: 1 }
    });
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const searchQuery = buildSearchQuery(req.query.search);
    
    let query = { ...searchQuery };
    
    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;
    if (req.query.featured) query['featured.isFeatured'] = req.query.featured === 'true';
    if (req.query.skinType) query.skinType = { $in: [req.query.skinType] };
    
    const sort = req.query.sort || '-createdAt';
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('images.mediaId')
      .sort(sort)
      .limit(limit)
      .skip(skip);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('images.mediaId')
      .populate({
        path: 'reviews',
        match: { status: 'approved' },
        options: { sort: '-createdAt', limit: 10 }
      });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    product.viewCount += 1;
    await product.save();
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    req.body.updatedBy = req.admin.id;
    
    const oldProduct = await Product.findById(req.params.id);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    if (oldProduct.category.toString() !== product.category.toString()) {
      await Category.findByIdAndUpdate(oldProduct.category, { $inc: { productCount: -1 } });
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 }
    });
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const { productIds, status } = req.body;
    
    await Product.updateMany(
      { _id: { $in: productIds } },
      { status }
    );
    
    res.json({
      success: true,
      message: `${productIds.length} products updated`
    });
  } catch (error) {
    next(error);
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      trackInventory: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).populate('category', 'name');
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};


