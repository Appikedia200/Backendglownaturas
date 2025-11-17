const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  singleton: {
    type: Boolean,
    default: true,
    unique: true
  },
  storeInfo: {
    name: {
      type: String,
      default: 'GlowNaturas'
    },
    email: {
      type: String,
      default: 'orders@glownaturas.com'
    },
    phone: String,
    address: String
  },
  whatsapp: {
    number: {
      type: String,
      default: '2348012345678'
    },
    showFloatButton: {
      type: Boolean,
      default: true
    },
    floatPosition: {
      type: String,
      enum: ['left', 'right'],
      default: 'right'
    },
    welcomeMessage: {
      type: String,
      default: 'Hi! How can we help you today?'
    }
  },
  emailTemplates: {
    orderConfirmation: {
      subject: {
        type: String,
        default: 'Order Confirmation - {{orderId}}'
      },
      body: String
    },
    orderProcessing: {
      subject: String,
      body: String
    },
    orderShipped: {
      subject: String,
      body: String
    },
    orderDelivered: {
      subject: String,
      body: String
    }
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);

