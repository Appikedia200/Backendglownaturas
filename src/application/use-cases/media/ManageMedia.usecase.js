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

    // Upload to storage (Cloudinary)
    const uploadResult = await this.storageService.upload(file, {
      folder: 'glownatura',
      resource_type: 'auto'
    });

    // Create media record
    const media = await this.mediaRepository.create({
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type,
      altText,
      cloudinary: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes
      },
      uploadedBy
    });

    logger.info('Media uploaded successfully', {
      mediaId: media._id,
      publicId: uploadResult.public_id,
      uploadedBy
    });

    return media;
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
    if (media.cloudinary?.publicId) {
      await this.storageService.delete(media.cloudinary.publicId);
    }

    // Delete from database
    await this.mediaRepository.delete(id);
    
    logger.info('Media deleted', { 
      mediaId: id,
      publicId: media.cloudinary?.publicId 
    });

    return { message: 'Media deleted successfully' };
  }
}

module.exports = ManageMediaUseCase;

