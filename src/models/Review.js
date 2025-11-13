const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: String,
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    const Product = mongoose.model('Product');
    const Review = mongoose.model('Review');
    
    const reviews = await Review.find({
      product: this.product,
      status: 'approved'
    });
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(this.product, {
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length
      });
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);

