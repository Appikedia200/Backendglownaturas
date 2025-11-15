const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: String,
    country: {
      type: String,
      default: 'Nigeria'
    }
  },
  
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    productSku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  
  subtotal: {
    type: Number,
    required: true
  },
  
  shippingFee: {
    type: Number,
    required: true,
    default: 0
  },
  
  tax: {
    type: Number,
    default: 0
  },
  
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    }
  },
  
  total: {
    type: Number,
    required: true
  },
  
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash_on_delivery', 'card'],
    default: 'bank_transfer'
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  paymentDetails: {
    bankName: String,
    accountNumber: String,
    transactionReference: String,
    paidAt: Date,
    paidAmount: Number,
    paymentProof: {
      url: String,
      uploadedAt: Date
    }
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  shipping: {
    method: {
      type: String,
      enum: ['courier', 'local_delivery', 'pickup'],
      default: 'courier'
    },
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    riderContact: String,
    customMessage: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  
  notes: {
    customer: String,
    internal: String
  },
  
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    by: String,
    note: String
  }],
  
  tags: [{
    type: String,
    lowercase: true
  }],
  
  refund: {
    status: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'completed'],
      default: 'none'
    },
    amount: Number,
    reason: String,
    requestedAt: Date,
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  
  expiresAt: {
    type: Date,
    index: true
  },
  
  cancelledAt: Date,
  cancelReason: String
  
}, {
  timestamps: true
});

// Additional Indexes (orderId and expiresAt already have indexes from field definitions)
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1, paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
orderSchema.index({ status: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ 'customer.email': 1, createdAt: -1 });
orderSchema.index({ status: 1, expiresAt: 1 }); // For expired orders job

// Virtual for days since order
orderSchema.virtual('daysSinceOrder').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Order', orderSchema);
