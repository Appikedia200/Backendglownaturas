/**
 * Review Validation Schemas
 * Express-validator middleware for review endpoints
 * @version 5.1.0
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../../../shared/errors/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};

/**
 * Validate update review status
 */
const validateUpdateReviewStatus = [
  param('id')
    .isMongoId().withMessage('Invalid review ID'),
  
  body('status')
    .isIn(['pending', 'approved', 'rejected']).withMessage('Invalid review status'),
  
  validate
];

/**
 * Validate get reviews query
 */
const validateGetReviews = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected']).withMessage('Invalid review status'),
  
  validate
];

/**
 * Validate review ID param
 */
const validateReviewId = [
  param('id')
    .isMongoId().withMessage('Invalid review ID'),
  
  validate
];

/**
 * Validate product ID param
 */
const validateProductId = [
  param('productId')
    .isMongoId().withMessage('Invalid product ID'),
  
  validate
];

module.exports = {
  validateUpdateReviewStatus,
  validateGetReviews,
  validateReviewId,
  validateProductId,
};

