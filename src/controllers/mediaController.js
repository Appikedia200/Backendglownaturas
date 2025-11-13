const Media = require('../models/Media');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const folder = req.body.folder || 'general';
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `glownaturas/${folder}`,
      resource_type: 'auto'
    });
    
    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      cloudinary: {
        url: result.url,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes
      },
      type: result.resource_type === 'video' ? 'video' : 'image',
      alt: req.body.alt,
      caption: req.body.caption,
      folder,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      uploadedBy: req.admin.id
    });
    
    await fs.unlink(req.file.path);
    
    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Failed to delete file:', err));
    }
    next(error);
  }
};

exports.getAllMedia = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (req.query.type) query.type = req.query.type;
    if (req.query.folder) query.folder = req.query.folder;
    if (req.query.tags) query.tags = { $in: req.query.tags.split(',') };
    
    const media = await Media.find(query)
      .populate('uploadedBy', 'name email')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);
    
    const total = await Media.countDocuments(query);
    
    res.json({
      success: true,
      count: media.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: media
    });
  } catch (error) {
    next(error);
  }
};

exports.getMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id).populate('uploadedBy', 'name email');
    
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
    next(error);
  }
};

exports.updateMedia = async (req, res, next) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      {
        alt: req.body.alt,
        caption: req.body.caption,
        tags: req.body.tags
      },
      { new: true, runValidators: true }
    );
    
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
    next(error);
  }
};

exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }
    
    await cloudinary.uploader.destroy(media.cloudinary.publicId);
    await media.deleteOne();
    
    res.json({
      success: true,
      message: 'Media deleted'
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkDeleteMedia = async (req, res, next) => {
  try {
    const { mediaIds } = req.body;
    
    const mediaItems = await Media.find({ _id: { $in: mediaIds } });
    
    const deletePromises = mediaItems.map(media => 
      cloudinary.uploader.destroy(media.cloudinary.publicId)
    );
    
    await Promise.all(deletePromises);
    await Media.deleteMany({ _id: { $in: mediaIds } });
    
    res.json({
      success: true,
      message: `${mediaIds.length} media items deleted`
    });
  } catch (error) {
    next(error);
  }
};

