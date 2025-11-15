/**
 * Search Helper Utility
 * Provides secure search query sanitization to prevent ReDoS attacks
 * 
 * @module utils/searchHelper
 * @version 5.1.0
 */

/**
 * Escape regex special characters to prevent ReDoS attacks
 * Protects against Regular Expression Denial of Service by escaping all special regex characters
 * 
 * @param {string} str - User input to sanitize
 * @returns {string} Escaped string safe for regex
 */
exports.escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  // Escape all special regex characters: . * + ? ^ $ { } ( ) | [ ] \
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate and sanitize search query
 * Ensures search input is safe, non-empty, and within length limits
 * 
 * @param {string} query - Search query from user
 * @param {number} maxLength - Maximum allowed length (default: 100 characters)
 * @returns {string|null} Sanitized query or null if invalid
 */
exports.sanitizeSearchQuery = (query, maxLength = 100) => {
  // Validate input type
  if (!query || typeof query !== 'string') return null;
  
  const trimmed = query.trim();
  
  // Reject empty or excessively long queries
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  
  // Return escaped query safe for regex
  return exports.escapeRegex(trimmed);
};

/**
 * Build safe MongoDB regex query for single field
 * Creates a case-insensitive MongoDB query object with sanitized regex
 * 
 * @param {string} field - Field name to search
 * @param {string} searchTerm - Sanitized search term
 * @returns {Object|null} MongoDB query object or null if invalid
 */
exports.buildSafeRegexQuery = (field, searchTerm) => {
  const sanitized = exports.sanitizeSearchQuery(searchTerm);
  
  if (!sanitized) return null;
  
  return {
    [field]: {
      $regex: sanitized,
      $options: 'i' // Case-insensitive search
    }
  };
};

/**
 * Build safe MongoDB regex query for multiple fields (OR condition)
 * Creates a MongoDB $or query with sanitized regex across multiple fields
 * 
 * @param {Array<string>} fields - Array of field names to search
 * @param {string} searchTerm - User search input
 * @returns {Object|null} MongoDB $or query object or null if invalid
 * 
 * @example
 * const query = buildMultiFieldRegexQuery(['name', 'email'], 'john');
 * // Returns: { $or: [{ name: { $regex: 'john', $options: 'i' } }, { email: { $regex: 'john', $options: 'i' } }] }
 */
exports.buildMultiFieldRegexQuery = (fields, searchTerm) => {
  const sanitized = exports.sanitizeSearchQuery(searchTerm);
  
  if (!sanitized || !Array.isArray(fields) || fields.length === 0) return null;
  
  const orConditions = fields.map(field => ({
    [field]: {
      $regex: sanitized,
      $options: 'i'
    }
  }));
  
  return { $or: orConditions };
};

/**
 * Validate search query length and format
 * Returns validation result with error message if invalid
 * 
 * @param {string} query - Search query to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum query length (default: 1)
 * @param {number} options.maxLength - Maximum query length (default: 100)
 * @returns {Object} { isValid: boolean, error?: string, sanitized?: string }
 */
exports.validateSearchQuery = (query, options = {}) => {
  const { minLength = 1, maxLength = 100 } = options;
  
  // Type check
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      error: 'Search query must be a non-empty string'
    };
  }
  
  const trimmed = query.trim();
  
  // Length validation
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `Search query must be at least ${minLength} character(s)`
    };
  }
  
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Search query must not exceed ${maxLength} characters`
    };
  }
  
  // Return sanitized query
  return {
    isValid: true,
    sanitized: exports.escapeRegex(trimmed)
  };
};

