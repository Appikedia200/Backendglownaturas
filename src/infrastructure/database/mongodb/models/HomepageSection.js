const mongoose = require('mongoose');

/**
 * Homepage Section Model
 * Controls dynamic content on frontend homepage
 * Sections: Featured Products, New Arrivals, Back in Stock
 * @version 5.1.0
 */
const homepageSectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    enum: ['featured', 'new_arrivals', 'back_in_stock', 'trending', 'best_sellers'],
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    default: function() {
      const titles = {
        featured: 'Featured Items',
        new_arrivals: 'New Arrivals',
        back_in_stock: 'Back in Stock',
        trending: 'Trending Now',
        best_sellers: 'Best Sellers'
      };
      return titles[this.sectionType] || 'Featured';
    }
  },
  subtitle: {
    type: String,
    default: ''
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  autoUpdate: {
    type: Boolean,
    default: false, // If true, automatically populate based on criteria
    description: 'Auto-populate products based on section type (e.g., new_arrivals shows recently added products)'
  },
  maxProducts: {
    type: Number,
    default: 8,
    min: 1,
    max: 20
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Virtual fields for frontend compatibility (Admin Panel expects 'type' and 'active')
homepageSectionSchema.virtual('type').get(function() {
  return this.sectionType;
});

homepageSectionSchema.virtual('active').get(function() {
  return this.isActive;
});

// Ensure virtuals are included in JSON responses
homepageSectionSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Add virtual fields
    ret.type = ret.sectionType;
    ret.active = ret.isActive;
    return ret;
  }
});

homepageSectionSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.type = ret.sectionType;
    ret.active = ret.isActive;
    return ret;
  }
});

// Index for performance
homepageSectionSchema.index({ sectionType: 1 });
homepageSectionSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);

