const Media = require('../models/Media');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const logger = require('../config/logger');

// Helper to generate clean filename
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Upload single or multiple files
exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    const uploadedMedia = [];
    
    for (const file of req.files) {
      // Generate clean filename
      const cleanFilename = generateSlug(file.originalname.split('.')[0]) + '-' + Date.now();
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'glownatura/products',
        public_id: cleanFilename,
        transformation: [
          { width: 1200, height: 1800, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      });
      
      // Create media entry
      const media = await Media.create({
        filename: cleanFilename,
        originalName: file.originalname,
        title: file.originalname.split('.')[0],
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        cloudinaryFolder: 'glownatura/products',
        fileSize: file.size,
        mimeType: file.mimetype,
        width: result.width,
        height: result.height,
        uploadedBy: req.admin._id
      });
      
      uploadedMedia.push(media);
      
      logger.info(`Media uploaded: ${media.filename} by ${req.admin.name}`);
    }
    
    res.status(201).json({
      success: true,
      count: uploadedMedia.length,
      data: uploadedMedia
    });
  } catch (error) {
    logger.error(`Media upload failed: ${error.message}`);
    next(error);
  }
};

// Get all media with filtering and pagination
exports.getAllMedia = async (req, res, next) => {
  try {
    const { 
      search, 
      tags, 
      page = 1, 
      limit = 20,
      sortBy = '-createdAt',
      inUse
    } = req.query;
    
    let query = {};
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    // Filter by usage
    if (inUse === 'true') {
      query.usedInProducts = { $exists: true, $ne: [] };
    } else if (inUse === 'false') {
      query.$or = [
        { usedInProducts: { $exists: false } },
        { usedInProducts: [] }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const media = await Media.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name email')
      .select('-__v');
    
    const total = await Media.countDocuments(query);
    
    res.json({
      success: true,
      count: media.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: media
    });
  } catch (error) {
    logger.error(`Get media failed: ${error.message}`);
    next(error);
  }
};

// Get single media
exports.getMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('usedInProducts', 'name slug');
    
    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }
    
    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    logger.error(`Get media failed: ${error.message}`);
    next(error);
  }
};

// Update media metadata
exports.updateMedia = async (req, res, next) => {
  try {
    const { title, altText, description, tags } = req.body;
    
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }
    
    if (title !== undefined) media.title = title;
    if (altText !== undefined) media.altText = altText;
    if (description !== undefined) media.description = description;
    if (tags !== undefined) media.tags = tags;
    
    await media.save();
    
    logger.info(`Media updated: ${media.filename} by ${req.admin.name}`);
    
    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    logger.error(`Update media failed: ${error.message}`);
    next(error);
  }
};

// Delete media
exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }
    
    // Check if media is in use
    if (media.usedInProducts && media.usedInProducts.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete media that is in use by products',
        usedBy: media.usedInProducts.length
      });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.cloudinaryPublicId);
    
    // Delete from database
    await media.deleteOne();
    
    logger.info(`Media deleted: ${media.filename} by ${req.admin.name}`);
    
    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete media failed: ${error.message}`);
    next(error);
  }
};

// Bulk delete unused media
exports.bulkDeleteUnused = async (req, res, next) => {
  try {
    const unusedMedia = await Media.find({
      $or: [
        { usedInProducts: { $exists: false } },
        { usedInProducts: [] }
      ]
    });
    
    let deleted = 0;
    
    for (const media of unusedMedia) {
      await cloudinary.uploader.destroy(media.cloudinaryPublicId);
      await media.deleteOne();
      deleted++;
    }
    
    logger.info(`Bulk deleted ${deleted} unused media by ${req.admin.name}`);
    
    res.json({
      success: true,
      message: `${deleted} unused media files deleted`
    });
  } catch (error) {
    logger.error(`Bulk delete failed: ${error.message}`);
    next(error);
  }
};
