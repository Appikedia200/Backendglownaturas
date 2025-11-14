const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  shortDescription: {
    type: String,
    maxlength: [160, 'Short description cannot exceed 160 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  images: [{
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: [0, 'Reserved stock cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  trackInventory: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  ingredients: [{
    type: String,
    trim: true
  }],
  concerns: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  skinType: [{
    type: String,
    lowercase: true,
    enum: ['oily', 'dry', 'combination', 'sensitive', 'normal', 'all']
  }],
  brand: {
    type: String,
    trim: true
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  featured: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredOrder: Number
  },
  backInStock: {
    isBackInStock: {
      type: Boolean,
      default: false
    },
    backInStockDate: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  orderCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
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

productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

productSchema.virtual('availableStock').get(function() {
  return this.stock - this.reservedStock;
});

productSchema.methods.reserveStock = async function(quantity) {
  if (this.availableStock < quantity) {
    throw new Error(`Insufficient stock available for ${this.name}. Available: ${this.availableStock}, Requested: ${quantity}`);
  }
  this.reservedStock += quantity;
  await this.save();
  return this;
};

productSchema.methods.releaseStock = async function(quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  await this.save();
  return this;
};

productSchema.methods.confirmStockDeduction = async function(quantity) {
  if (this.reservedStock < quantity) {
    throw new Error(`Cannot confirm stock deduction. Reserved: ${this.reservedStock}, Requested: ${quantity}`);
  }
  this.stock -= quantity;
  this.reservedStock -= quantity;
  await this.save();
  return this;
};

productSchema.index({ name: 'text', description: 'text', keywords: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1 });

module.exports = mongoose.model('Product', productSchema);

