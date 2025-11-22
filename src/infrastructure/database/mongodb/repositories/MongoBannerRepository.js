const IBannerRepository = require('../../../../domain/repositories/IBannerRepository');
const Banner = require('../models/Banner');
const { NotFoundError, ValidationError } = require('../../../../shared/errors/AppError');

/**
 * MongoDB Banner Repository Implementation (Adapter)
 * Implements IBannerRepository using Mongoose
 * @version 1.0.0
 */
class MongoBannerRepository extends IBannerRepository {
  async findBySection(section) {
    const banner = await Banner.findOne({ section })
      .populate('images.mediaId', 'cloudinaryUrl filename altText');
    return banner ? this._transformBanner(banner) : null;
  }

  async findAll(options = {}) {
    const { activeOnly = false } = options;

    const query = activeOnly ? { isActive: true } : {};

    const banners = await Banner.find(query)
      .populate('images.mediaId', 'cloudinaryUrl filename altText')
      .sort({ section: 1 });

    return banners.map(banner => this._transformBanner(banner));
  }

  async create(bannerData) {
    // Validate max 8 images
    if (bannerData.images && bannerData.images.length > 8) {
      throw new ValidationError('Maximum 8 images allowed per section');
    }

    const banner = await Banner.create(bannerData);
    const populated = await Banner.findById(banner._id)
      .populate('images.mediaId', 'cloudinaryUrl filename altText');

    return this._transformBanner(populated);
  }

  async update(section, updates) {
    // Validate max 8 images if updating images
    if (updates.images && updates.images.length > 8) {
      throw new ValidationError('Maximum 8 images allowed per section');
    }

    const banner = await Banner.findOneAndUpdate(
      { section },
      updates,
      { new: true, runValidators: true }
    ).populate('images.mediaId', 'cloudinaryUrl filename altText');

    if (!banner) {
      throw new NotFoundError(`Banner for section '${section}' not found`);
    }

    return this._transformBanner(banner);
  }

  async delete(section) {
    const banner = await Banner.findOneAndDelete({ section });
    if (!banner) {
      throw new NotFoundError(`Banner for section '${section}' not found`);
    }
  }

  async addImage(section, imageData) {
    const banner = await Banner.findOne({ section });

    if (!banner) {
      throw new NotFoundError(`Banner for section '${section}' not found`);
    }

    // Check max 8 images
    if (banner.images.length >= 8) {
      throw new ValidationError('Maximum 8 images allowed per section');
    }

    // Auto-assign order if not provided
    if (imageData.order === undefined) {
      imageData.order = banner.images.length;
    }

    banner.images.push(imageData);
    await banner.save();

    const populated = await Banner.findById(banner._id)
      .populate('images.mediaId', 'cloudinaryUrl filename altText');

    return this._transformBanner(populated);
  }

  async removeImage(section, mediaId) {
    const banner = await Banner.findOne({ section });

    if (!banner) {
      throw new NotFoundError(`Banner for section '${section}' not found`);
    }

    const initialLength = banner.images.length;
    banner.images = banner.images.filter(img => img.mediaId.toString() !== mediaId);

    if (banner.images.length === initialLength) {
      throw new NotFoundError(`Image not found in banner section '${section}'`);
    }

    // Reorder remaining images
    banner.images.forEach((img, index) => {
      img.order = index;
    });

    await banner.save();

    const populated = await Banner.findById(banner._id)
      .populate('images.mediaId', 'cloudinaryUrl filename altText');

    return this._transformBanner(populated);
  }

  async reorderImages(section, orderedImageIds) {
    const banner = await Banner.findOne({ section });

    if (!banner) {
      throw new NotFoundError(`Banner for section '${section}' not found`);
    }

    // Validate that all provided IDs exist in banner
    const existingIds = banner.images.map(img => img._id.toString());
    const allIdsValid = orderedImageIds.every(id => existingIds.includes(id));

    if (!allIdsValid) {
      throw new ValidationError('Invalid image IDs provided');
    }

    // Reorder images array
    const reorderedImages = [];
    orderedImageIds.forEach((id, index) => {
      const image = banner.images.find(img => img._id.toString() === id);
      if (image) {
        image.order = index;
        reorderedImages.push(image);
      }
    });

    banner.images = reorderedImages;
    await banner.save();

    const populated = await Banner.findById(banner._id)
      .populate('images.mediaId', 'cloudinaryUrl filename altText');

    return this._transformBanner(populated);
  }

  /**
   * Transform banner for frontend compatibility
   * @private
   */
  _transformBanner(banner) {
    if (!banner) return null;

    const bannerObj = banner.toObject ? banner.toObject() : banner;

    // Transform image media references to include URL
    if (bannerObj.images && bannerObj.images.length > 0) {
      bannerObj.images = bannerObj.images.map(img => ({
        ...img,
        mediaId: img.mediaId._id || img.mediaId,
        url: img.mediaId.cloudinaryUrl || '',
        filename: img.mediaId.filename || '',
        altText: img.altText || img.mediaId.altText || ''
      })).sort((a, b) => a.order - b.order); // Ensure proper order
    }

    return bannerObj;
  }
}

module.exports = MongoBannerRepository;
