/**
 * Storage Service Interface (Port)
 * Defines contract for file storage operations
 * @interface
 * @version 5.1.0
 */
class IStorageService {
  /**
   * Upload file
   * @param {Buffer} fileBuffer
   * @param {string} folder
   * @param {Object} options
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async upload(fileBuffer, folder, options = {}) {
    throw new Error('Method not implemented: upload');
  }

  /**
   * Delete file
   * @param {string} publicId
   * @returns {Promise<void>}
   */
  async delete(publicId) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Update file
   * @param {string} publicId
   * @param {Buffer} fileBuffer
   * @param {Object} options
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async update(publicId, fileBuffer, options = {}) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Get file URL
   * @param {string} publicId
   * @returns {string}
   */
  getUrl(publicId) {
    throw new Error('Method not implemented: getUrl');
  }
}

module.exports = IStorageService;

