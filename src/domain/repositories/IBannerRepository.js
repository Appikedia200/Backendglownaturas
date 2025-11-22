/**
 * Banner Repository Interface (Port)
 * Defines contract for banner data access
 * @interface
 * @version 1.0.0
 */
class IBannerRepository {
  /**
   * Find banner by section name
   * @param {string} section - Section name (featured, new-arrivals, etc.)
   * @returns {Promise<Banner|null>}
   */
  async findBySection(section) {
    throw new Error('Method not implemented: findBySection');
  }

  /**
   * Find all banners
   * @param {Object} options - Query options
   * @returns {Promise<Banner[]>}
   */
  async findAll(options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Create new banner
   * @param {Object} bannerData - Banner data
   * @returns {Promise<Banner>}
   */
  async create(bannerData) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Update banner
   * @param {string} section - Section name
   * @param {Object} updates - Update data
   * @returns {Promise<Banner>}
   */
  async update(section, updates) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Delete banner
   * @param {string} section - Section name
   * @returns {Promise<void>}
   */
  async delete(section) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Add image to banner section
   * @param {string} section - Section name
   * @param {Object} imageData - Image data
   * @returns {Promise<Banner>}
   */
  async addImage(section, imageData) {
    throw new Error('Method not implemented: addImage');
  }

  /**
   * Remove image from banner section
   * @param {string} section - Section name
   * @param {string} mediaId - Media ID to remove
   * @returns {Promise<Banner>}
   */
  async removeImage(section, mediaId) {
    throw new Error('Method not implemented: removeImage');
  }

  /**
   * Reorder images in banner section
   * @param {string} section - Section name
   * @param {Array} orderedImageIds - Array of image IDs in new order
   * @returns {Promise<Banner>}
   */
  async reorderImages(section, orderedImageIds) {
    throw new Error('Method not implemented: reorderImages');
  }
}

module.exports = IBannerRepository;
