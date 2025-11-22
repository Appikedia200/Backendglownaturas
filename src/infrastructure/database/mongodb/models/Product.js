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
    type: Boolean,
    default: false,
    index: true
  },
  isNewArrival: {
    type: Boolean,
    default: false,
    index: true
  },
  isBestSeller: {
    type: Boolean,
    default: false,
    index: true
  },
  backInStock: {
    type: Boolean,
    default: false,
    index: true
  },
  backInStockDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
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
  },
  // Jewelry-specific fields (for jewelry products only)
  jewelry: {
    material: {
      type: String,
      enum: ['gold', 'silver', 'platinum', 'white-gold', 'rose-gold', 'titanium', 'stainless-steel', 'brass', 'copper'],
      required: false
    },
    purity: {
      type: String,
      enum: ['24k', '22k', '18k', '14k', '10k', '925-sterling', '999-fine', '958-britannia', 'other'],
      required: false
    },
    metalWeight: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['grams', 'ounces', 'carats'], default: 'grams' }
    },
    stone: {
      type: {
        type: String,
        enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'amethyst', 'topaz', 'garnet', 'opal', 'turquoise', 'cubic-zirconia', 'moissanite', 'none']
      },
      caratWeight: { type: Number, min: 0 },
      clarity: {
        type: String,
        enum: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3', 'N/A']
      },
      color: {
        type: String,
        enum: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'fancy', 'N/A']
      },
      cut: {
        type: String,
        enum: ['excellent', 'very-good', 'good', 'fair', 'poor', 'N/A']
      }
    },
    size: {
      type: { type: String, enum: ['ring-size', 'length', 'diameter', 'adjustable', 'one-size'] },
      value: { type: String },
      unit: { type: String, enum: ['US', 'UK', 'EU', 'mm', 'cm', 'inches'] }
    },
    certification: {
      available: { type: Boolean, default: false },
      issuedBy: { type: String },
      certificateNumber: { type: String }
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex', 'kids'],
      required: false
    },
    type: {
      type: String,
      enum: ['ring', 'necklace', 'bracelet', 'earrings', 'pendant', 'chain', 'bangle', 'anklet', 'brooch', 'cufflinks', 'nose-ring', 'toe-ring'],
      required: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
productSchema.index({ 'jewelry.material': 1, 'jewelry.purity': 1, 'jewelry.stone.type': 1, 'jewelry.gender': 1, 'jewelry.type': 1 });

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
productSchema.index({ status: 1, featured: -1 }); // Featured products
productSchema.index({ status: 1, isNewArrival: -1 }); // New arrivals
productSchema.index({ status: 1, isBestSeller: -1 }); // Best sellers
productSchema.index({ status: 1, backInStock: -1 }); // Back in stock

module.exports = mongoose.model('Product', productSchema);

