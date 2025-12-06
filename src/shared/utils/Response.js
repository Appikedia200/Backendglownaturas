/**
 * Standardized API Response Format
 * Ensures consistent response structure across all endpoints
 * @version 5.1.0
 */
class Response {
  static success(data, meta = {}) {
    return {
      success: true,
      data,
      ...meta,
    };
  }

  static created(data, meta = {}) {
    return {
      success: true,
      data,
      ...meta,
    };
  }

  static paginated(data, pagination) {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    return {
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages, // Frontend expects "totalPages"
        hasNextPage: pagination.page < totalPages, // Changed to match frontend
        hasPrevPage: pagination.page > 1, // Changed to match frontend
      }
    };
  }

  static error(message, errorCode, statusCode = 500, details = null) {
    const response = {
      success: false,
      error: {
        message,
        code: errorCode,
        statusCode,
      }
    };
    
    if (details) {
      response.error.details = details;
    }
    
    return response;
  }
}

module.exports = Response;

