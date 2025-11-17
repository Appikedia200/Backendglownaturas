/**
 * Media Repository Interface (Port)
 * Defines contract for media/file data access
 * @interface
 * @version 5.1.0
 */
class IMediaRepository {
  /**
   * Find media by ID
   * @param {string} id
   * @returns {Promise<Media>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all media
   * @param {Object} filters
   * @param {Object} options
   * @returns {Promise<{media: Media[], total: number}>}
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Create media record
   * @param {Object} mediaData
   * @returns {Promise<Media>}
   */
  async create(mediaData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update media
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Media>}
   */
  async update(id, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete media
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find by public ID (Cloudinary)
   * @param {string} publicId
   * @returns {Promise<Media>}
   */
  async findByPublicId(publicId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get media by type
   * @param {string} type
   * @returns {Promise<Media[]>}
   */
  async findByType(type) {
    throw new Error('Method not implemented');
  }
}

module.exports = IMediaRepository;

