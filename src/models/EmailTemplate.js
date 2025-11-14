const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  templateType: {
    type: String,
    enum: [
      'order_pending',
      'payment_confirmed',
      'order_shipped_courier',
      'order_shipped_local',
      'order_shipped_pickup',
      'order_delivered',
      'order_cancelled'
    ],
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    required: true
  },
  variables: [{
    name: String,
    description: String,
    example: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);

