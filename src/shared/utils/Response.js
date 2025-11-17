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
    return {
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1,
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

