const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'approve', 'reject', 'login', 'logout', 'activate', 'deactivate'],
    required: true
  },
  resource: {
    type: String,
    enum: ['product', 'category', 'order', 'review', 'admin', 'media', 'settings'],
    required: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

adminLogSchema.index({ admin: 1, timestamp: -1 });
adminLogSchema.index({ resource: 1, resourceId: 1 });
adminLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);

