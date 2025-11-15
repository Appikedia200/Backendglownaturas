const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const logger = require('../config/logger');

exports.sanitizeData = [
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn(`Sanitized potential NoSQL injection in ${key}`, {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('user-agent'),
        sanitizedKey: key
      });
    }
  }),
  
  xss()
];

