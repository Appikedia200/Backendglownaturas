/**
 * Authentication Validators
 * Centralized validation logic following DRY principle
 * Single source of truth for all input validation
 * 
 * @module validators/authValidator
 * @version 5.1.0
 */

/**
 * Validate email format and domain
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid and error/value
 */
exports.validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }
  
  // Email format validation
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please provide a valid email address'
    };
  }
  
  // Company domain validation
  const companyDomain = process.env.COMPANY_EMAIL_DOMAIN || 'glownatura.com';
  if (!email.toLowerCase().endsWith(`@${companyDomain}`)) {
    return {
      isValid: false,
      error: `Please use your company email address (@${companyDomain})`
    };
  }
  
  return { isValid: true, value: email.toLowerCase() };
};

/**
 * Validate password strength
 * Enforces strong password requirements to prevent weak passwords
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with detailed errors
 */
exports.validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required'
    };
  }
  
  // Minimum length
  if (password.length < 8) {
    errors.push('at least 8 characters');
  }
  
  // Maximum length (prevent DoS attacks via extremely long passwords)
  if (password.length > 128) {
    return {
      isValid: false,
      error: 'Password must be less than 128 characters'
    };
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  
  // Number
  if (!/\d/.test(password)) {
    errors.push('one number');
  }
  
  // Special character
  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('one special character (@$!%*?&#)');
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      error: `Password must contain ${errors.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {Object} Validation result
 */
exports.validateName = (name) => {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: 'Name is required'
    };
  }
  
  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters'
    };
  }
  
  if (name.trim().length > 50) {
    return {
      isValid: false,
      error: 'Name must be less than 50 characters'
    };
  }
  
  return { isValid: true, value: name.trim() };
};

