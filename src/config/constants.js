module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  ADMIN_EMAIL_DOMAIN: process.env.ADMIN_EMAIL_DOMAIN || 'glownaturas.com',
  
  SHIPPING_RATES: {
    lagos: 2000,
    abuja: 2500,
    'port harcourt': 2500,
    ibadan: 2000,
    kano: 3000,
    default: 3500
  },
  
  ORDER_EXPIRY_HOURS: 6,
  
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  
  ORDER_STATUSES: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  PAYMENT_STATUSES: ['pending', 'paid', 'failed', 'refunded'],
  REVIEW_STATUSES: ['pending', 'approved', 'rejected']
};

