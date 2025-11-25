/**
 * Manage Media Use Case
 * Handles media upload, delete, and management business logic
 * @version 5.1.0
 */

const { ValidationError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

class ManageMediaUseCase {
  /**
   * @param {IMediaRepository} mediaRepository
   * @param {IStorageService} storageService
   */
  constructor(mediaRepository, storageService) {
    this.mediaRepository = mediaRepository;
    this.storageService = storageService;
  }

  /**
   * Upload media file
   */
  async uploadMedia(file, uploadedBy, altText = '', type = 'image') {
    // Validate file
    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate file type (images only)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ValidationError('Only image files (JPEG, PNG, GIF, WebP) are allowed');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ValidationError('File size must be less than 5MB');
    }

    // Generate a clean, SEO-friendly filename
    const timestamp = Date.now();
    const cleanFilename = this._sanitizeFilename(file.originalname);
    const publicId = `glownatura/${timestamp}-${cleanFilename}`;

    // Upload to storage (Cloudinary) with custom public_id
    const uploadResult = await this.storageService.upload(file, {
      folder: 'glownatura',
      resource_type: 'image',
      public_id: publicId,
      use_filename: true,
      unique_filename: false
    });

    // Extract just the filename without extension for display
    const displayFilename = file.originalname.replace(/\.[^/.]+$/, '');

    // Create media record with flat structure matching model
    const media = await this.mediaRepository.create({
      filename: displayFilename,
      originalName: file.originalname,
      altText: altText || displayFilename,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryFolder: 'glownatura',
      fileSize: file.size,
      mimeType: file.mimetype,
      width: uploadResult.width,
      height: uploadResult.height,
      uploadedBy
    });

    logger.info('Media uploaded successfully', {
      mediaId: media._id,
      filename: displayFilename,
      publicId: uploadResult.public_id,
      uploadedBy
    });

    return media;
  }

  /**
   * Sanitize filename for URL-safe storage
   * @private
   */
  _sanitizeFilename(filename) {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // Replace spaces and special characters with hyphens
    // Keep only alphanumeric, hyphens, and underscores
    return nameWithoutExt
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Get all media
   */
  async getAllMedia(options = {}) {
    const { media, total } = await this.mediaRepository.findAll({}, options);
    
    return {
      media,
      total,
      page: options.page || 1,
      limit: options.limit || 20
    };
  }

  /**
   * Get media by ID
   */
  async getMediaById(id) {
    return await this.mediaRepository.findById(id);
  }

  /**
   * Update media
   */
  async updateMedia(id, updates) {
    const media = await this.mediaRepository.update(id, updates);
    
    logger.info('Media updated', { mediaId: id });
    
    return media;
  }

  /**
   * Delete media
   */
  async deleteMedia(id) {
    const media = await this.mediaRepository.findById(id);
    
    // Delete from storage (Cloudinary)
    if (media.cloudinaryPublicId) {
      try {
        await this.storageService.delete(media.cloudinaryPublicId);
      } catch (error) {
        logger.error('Failed to delete from Cloudinary', { 
          error: error.message,
          publicId: media.cloudinaryPublicId 
        });
        // Continue to delete from database even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await this.mediaRepository.delete(id);
    
    logger.info('Media deleted', { 
      mediaId: id,
      publicId: media.cloudinaryPublicId 
    });

    return { message: 'Media deleted successfully' };
  }
}

module.exports = ManageMediaUseCase;

