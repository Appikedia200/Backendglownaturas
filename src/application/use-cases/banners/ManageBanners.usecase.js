const { ConflictError, ValidationError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

/**
 * Manage Banners Use Case
 * Handles all banner section operations
 * @version 1.0.0
 */
class ManageBannersUseCase {
  /**
   * @param {IBannerRepository} bannerRepository
   */
  constructor(bannerRepository) {
    this.bannerRepository = bannerRepository;
  }

  /**
   * Get all banner sections
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getAll(options = {}) {
    return await this.bannerRepository.findAll(options);
  }

  /**
   * Get banner by section name
   * @param {string} section - Section name
   * @returns {Promise<Object|null>}
   */
  async getBySection(section) {
    const validSections = ['featured', 'new-arrivals', 'best-sellers', 'back-in-stock'];

    if (!validSections.includes(section)) {
      throw new ValidationError(`Invalid section. Must be one of: ${validSections.join(', ')}`);
    }

    return await this.bannerRepository.findBySection(section);
  }

  /**
   * Create new banner section
   * @param {Object} dto - Banner data
   * @returns {Promise<Object>}
   */
  async create(dto) {
    const { section, title, images = [] } = dto;

    // Validate required fields
    if (!section || !title) {
      throw new ValidationError('Section and title are required');
    }

    // Check if banner section already exists
    const existing = await this.bannerRepository.findBySection(section);
    if (existing) {
      throw new ConflictError(`Banner section '${section}' already exists`);
    }

    // Validate max 8 images
    if (images.length > 8) {
      throw new ValidationError('Maximum 8 images allowed per section');
    }

    const banner = await this.bannerRepository.create(dto);

    logger.info('Banner section created', {
      section: banner.section,
      imageCount: banner.images.length
    });

    return banner;
  }

  /**
   * Update banner section
   * @param {string} section - Section name
   * @param {Object} updates - Update data
   * @returns {Promise<Object>}
   */
  async update(section, updates) {
    // Validate max 8 images if updating images
    if (updates.images && updates.images.length > 8) {
      throw new ValidationError('Maximum 8 images allowed per section');
    }

    const banner = await this.bannerRepository.update(section, updates);

    logger.info('Banner section updated', {
      section: banner.section,
      updates: Object.keys(updates)
    });

    return banner;
  }

  /**
   * Delete banner section
   * @param {string} section - Section name
   * @returns {Promise<void>}
   */
  async delete(section) {
    await this.bannerRepository.delete(section);

    logger.info('Banner section deleted', { section });
  }

  /**
   * Add image to banner section
   * @param {string} section - Section name
   * @param {Object} imageData - Image data (mediaId, link, altText, order)
   * @returns {Promise<Object>}
   */
  async addImage(section, imageData) {
    const { mediaId, link, altText, order } = imageData;

    if (!mediaId) {
      throw new ValidationError('Media ID is required');
    }

    const banner = await this.bannerRepository.addImage(section, {
      mediaId,
      link: link || '',
      altText: altText || '',
      order: order !== undefined ? order : undefined
    });

    logger.info('Image added to banner section', {
      section,
      mediaId,
      imageCount: banner.images.length
    });

    return banner;
  }

  /**
   * Remove image from banner section
   * @param {string} section - Section name
   * @param {string} mediaId - Media ID to remove
   * @returns {Promise<Object>}
   */
  async removeImage(section, mediaId) {
    if (!mediaId) {
      throw new ValidationError('Media ID is required');
    }

    const banner = await this.bannerRepository.removeImage(section, mediaId);

    logger.info('Image removed from banner section', {
      section,
      mediaId,
      remainingImages: banner.images.length
    });

    return banner;
  }

  /**
   * Reorder images in banner section
   * @param {string} section - Section name
   * @param {Array<string>} imageIds - Array of image _id in desired order
   * @returns {Promise<Object>}
   */
  async reorderImages(section, imageIds) {
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      throw new ValidationError('Image IDs array is required');
    }

    const banner = await this.bannerRepository.reorderImages(section, imageIds);

    logger.info('Banner images reordered', {
      section,
      imageCount: banner.images.length
    });

    return banner;
  }
}

module.exports = ManageBannersUseCase;
