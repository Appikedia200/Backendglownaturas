const IReviewRepository = require('../../../../domain/repositories/IReviewRepository');
const Review = require('../models/Review');
const { NotFoundError } = require('../../../../shared/errors/AppError');

/**
 * MongoDB Review Repository Implementation (Adapter)
 * Implements IReviewRepository using Mongoose
 * @version 5.1.0
 */
class MongoReviewRepository extends IReviewRepository {
  async findById(id) {
    const review = await Review.findById(id)
      .populate('product', 'name images')
      .lean();
    
    if (!review) {
      throw new NotFoundError('Review');
    }
    
    return review;
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('product', 'name images')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    return { reviews, total };
  }

  async findByProduct(productId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status = 'approved',
    } = options;

    const query = { product: productId, status };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    return { reviews, total };
  }

  async updateStatus(id, status) {
    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('product', 'name images');
    
    if (!review) {
      throw new NotFoundError('Review');
    }
    
    return review.toObject();
  }

  async delete(id) {
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      throw new NotFoundError('Review');
    }
  }

  async calculateAverageRating(productId) {
    const result = await Review.aggregate([
      {
        $match: {
          product: productId,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    return result[0]?.averageRating || 0;
  }
}

module.exports = MongoReviewRepository;

