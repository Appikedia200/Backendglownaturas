const IStorageService = require('../../domain/services/IStorageService');
const cloudinary = require('cloudinary').v2;
const Config = require('../config');
const logger = require('../../config/logger');

/**
 * Cloudinary Storage Service Implementation (Adapter)
 * Implements IStorageService using Cloudinary
 * @version 5.1.0
 */
class CloudinaryStorageService extends IStorageService {
  constructor() {
    super();
    
    const config = Config.cloudinary;
    
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
    
    logger.info('Cloudinary configured successfully', {
      cloudName: config.cloudName
    });
  }

  async upload(fileBuffer, folder, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder || 'glownatura',
        resource_type: 'auto',
        ...options,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload failed', { error: error.message });
            reject(error);
          } else {
            logger.info('File uploaded to Cloudinary', {
              publicId: result.public_id,
              folder
            });
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  async delete(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info('File deleted from Cloudinary', { publicId });
    } catch (error) {
      logger.error('Cloudinary delete failed', {
        publicId,
        error: error.message
      });
      throw error;
    }
  }

  async update(publicId, fileBuffer, options = {}) {
    // Delete old file
    await this.delete(publicId);
    
    // Upload new file to same folder
    const folder = publicId.split('/').slice(0, -1).join('/');
    return await this.upload(fileBuffer, folder, options);
  }

  getUrl(publicId) {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
  }
}

module.exports = CloudinaryStorageService;

