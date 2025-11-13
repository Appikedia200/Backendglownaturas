const Review = require('../models/Review');
const Product = require('../models/Product');

exports.createReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.body.product);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const review = await Review.create(req.body);
    
    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (req.query.product) query.product = req.query.product;
    if (req.query.status) query.status = req.query.status;
    if (req.query.isVerifiedPurchase) query.isVerifiedPurchase = req.query.isVerifiedPurchase === 'true';
    
    const reviews = await Review.find(query)
      .populate('product', 'name slug')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);
    
    const total = await Review.countDocuments(query);
    
    res.json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('product', 'name slug');
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReviewStatus = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    await review.deleteOne();
    
    const reviews = await Review.find({
      product: review.product,
      status: 'approved'
    });
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(review.product, {
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length
      });
    } else {
      await Product.findByIdAndUpdate(review.product, {
        averageRating: 0,
        reviewCount: 0
      });
    }
    
    res.json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const { reviewIds, status } = req.body;
    
    await Review.updateMany(
      { _id: { $in: reviewIds } },
      { status }
    );
    
    const reviews = await Review.find({ _id: { $in: reviewIds } });
    const uniqueProducts = [...new Set(reviews.map(r => r.product.toString()))];
    
    for (const productId of uniqueProducts) {
      const productReviews = await Review.find({
        product: productId,
        status: 'approved'
      });
      
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        await Product.findByIdAndUpdate(productId, {
          averageRating: parseFloat(avgRating.toFixed(1)),
          reviewCount: productReviews.length
        });
      }
    }
    
    res.json({
      success: true,
      message: `${reviewIds.length} reviews updated`
    });
  } catch (error) {
    next(error);
  }
};

