const { sanitizeSearchQuery } = require('./searchHelper');

exports.generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GN-${timestamp}-${random}`;
};

exports.calculateShippingFee = (city, state) => {
  const SHIPPING_RATES = require('../config/constants').SHIPPING_RATES;
  
  const cityLower = city.toLowerCase();
  const rate = SHIPPING_RATES[cityLower] || SHIPPING_RATES.default;
  
  return rate;
};

exports.getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

exports.buildSearchQuery = (searchTerm) => {
  if (!searchTerm) return {};
  
  // Sanitize search term to prevent ReDoS attacks
  const sanitized = sanitizeSearchQuery(searchTerm);
  if (!sanitized) return {};
  
  return {
    $or: [
      { name: { $regex: sanitized, $options: 'i' } },
      { description: { $regex: sanitized, $options: 'i' } },
      { keywords: { $in: [new RegExp(sanitized, 'i')] } }
    ]
  };
};

exports.generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

