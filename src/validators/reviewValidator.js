/**
 * Review Validation Middleware
 * 
 * @module validators/reviewValidator
 * @version 5.1.0
 */

const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

exports.validateCreateReview = [
  body('product')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Review title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  
  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Comment must be 10-2000 characters'),
  
  body('customerName')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('customerEmail')
    .trim()
    .notEmpty().withMessage('Customer email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  validate
];

exports.validateUpdateReviewStatus = [
  param('id')
    .isMongoId().withMessage('Invalid review ID'),
  
  body('status')
    .isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  
  validate
];

exports.validateReviewId = [
  param('id')
    .isMongoId().withMessage('Invalid review ID'),
  
  validate
];

