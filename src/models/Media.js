const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  altText: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  cloudinaryFolder: {
    type: String,
    default: 'products'
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  usedInProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
mediaSchema.index({ filename: 1 });
mediaSchema.index({ title: 'text', altText: 'text', tags: 'text' });
mediaSchema.index({ usedInProducts: 1 });
mediaSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Media', mediaSchema);
