const Product = require('../models/Product');
const Category = require('../models/Category');

exports.generateSKU = async (categoryId = null) => {
  let sku;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    if (categoryId) {
      try {
        const category = await Category.findById(categoryId);
        if (category) {
          const categoryCode = category.name
            .toUpperCase()
            .substring(0, 5)
            .replace(/[^A-Z]/g, '');
          
          const count = await Product.countDocuments({ category: categoryId });
          const number = String(count + 1).padStart(3, '0');
          
          sku = `GN-${categoryCode}-${number}`;
        }
      } catch (error) {
        console.error('Error generating category-based SKU:', error);
      }
    }
    
    if (!sku) {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      sku = `GN-${timestamp}-${random}`;
    }
    
    const existing = await Product.findOne({ sku });
    isUnique = !existing;
    attempts++;
    
    if (!isUnique) {
      sku = null;
    }
  }
  
  if (!isUnique) {
    throw new Error('Failed to generate unique SKU after multiple attempts');
  }
  
  return sku;
};

