const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  cloudinary: {
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    secureUrl: String,
    format: String,
    width: Number,
    height: Number,
    size: Number
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    default: 'image'
  },
  alt: String,
  caption: String,
  folder: {
    type: String,
    default: 'general'
  },
  tags: [String],
  usedIn: [{
    model: String,
    modelId: mongoose.Schema.Types.ObjectId
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);

