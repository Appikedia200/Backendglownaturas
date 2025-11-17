/**
 * Pagination Utility
 * Handles pagination parameters validation and calculation
 * @version 5.1.0
 */
class Pagination {
  /**
   * Parse and validate pagination parameters
   * @param {Object} query - Request query params
   * @returns {Object} Validated pagination params
   */
  static parse(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Build pagination metadata
   * @param {number} total - Total number of documents
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @returns {Object} Pagination metadata
   */
  static buildMeta(total, page, limit) {
    const pages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  }
}

module.exports = Pagination;

