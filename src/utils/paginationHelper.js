/**
 * Pagination Helper Utility
 * Provides validated and consistent pagination across all endpoints
 * 
 * @module utils/paginationHelper
 * @version 5.1.0
 */

/**
 * Validate and sanitize pagination parameters
 * Ensures page and limit are valid positive integers within acceptable ranges
 * 
 * @param {Object} query - Request query object from req.query
 * @param {Object} options - Optional configuration
 * @param {number} options.defaultLimit - Default items per page (default: 20)
 * @param {number} options.maxLimit - Maximum items per page (default: 100)
 * @returns {Object} { page, limit, skip } - Validated pagination parameters
 * 
 * @example
 * const { page, limit, skip } = validatePagination(req.query);
 */
exports.validatePagination = (query, options = {}) => {
  const defaultLimit = options.defaultLimit || 20;
  const maxLimit = options.maxLimit || 100;
  
  // Parse and validate page number
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  
  // Parse and validate limit
  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  }
  
  // Enforce maximum limit to prevent excessive database queries
  limit = Math.min(limit, maxLimit);
  
  // Calculate skip for MongoDB
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Build pagination response metadata
 * Creates standardized pagination info for API responses
 * 
 * @param {number} total - Total document count from database
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata object
 * 
 * @example
 * const meta = buildPaginationMeta(total, page, limit);
 * res.json({ success: true, data: items, pagination: meta });
 */
exports.buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    pages: totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

/**
 * Build complete paginated response
 * Combines data with pagination metadata in standard format
 * 
 * @param {Array} data - Array of items for current page
 * @param {number} total - Total document count
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Complete API response object
 * 
 * @example
 * const response = buildPaginatedResponse(orders, total, page, limit);
 * res.json(response);
 */
exports.buildPaginatedResponse = (data, total, page, limit) => {
  return {
    success: true,
    count: data.length,
    data,
    pagination: exports.buildPaginationMeta(total, page, limit)
  };
};

