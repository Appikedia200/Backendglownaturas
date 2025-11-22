const mongoose = require('mongoose');

/**
 * Banner Model
 * Manages promotional banner images for different sections
 * Each section can have up to 8 images (4 visible, 4 rotating)
 */
const bannerSchema = new mongoose.Schema({
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: ['featured', 'new-arrivals', 'best-sellers', 'back-in-stock'],
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  images: [{
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 0,
      max: 7 // 0-7 for 8 images
    },
    link: {
      type: String, // Optional link when image is clicked
      trim: true
    },
    altText: {
      type: String,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validation: Max 8 images per section
bannerSchema.pre('save', function(next) {
  if (this.images && this.images.length > 8) {
    const error = new Error('Maximum 8 images allowed per section');
    return next(error);
  }

  // Ensure order values are unique within images array
  const orders = this.images.map(img => img.order);
  const uniqueOrders = new Set(orders);
  if (orders.length !== uniqueOrders.size) {
    const error = new Error('Image order values must be unique');
    return next(error);
  }

  next();
});

// Virtual field for frontend compatibility
bannerSchema.virtual('active').get(function() {
  return this.isActive;
});

// Index for efficient queries
bannerSchema.index({ section: 1, isActive: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
