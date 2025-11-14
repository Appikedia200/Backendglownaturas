const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

exports.sanitizeData = [
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized potential NoSQL injection in ${key}`);
    }
  }),
  
  xss()
];

