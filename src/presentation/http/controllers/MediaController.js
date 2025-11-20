/**
 * Media HTTP Controller
 * Handles HTTP requests for media - NO business logic
 * @version 5.1.0
 */

const Response = require('../../../shared/utils/Response');

class MediaController {
  /**
   * @param {ManageMediaUseCase} manageMediaUseCase
   */
  constructor(manageMediaUseCase) {
    this.manageMediaUseCase = manageMediaUseCase;
  }

  /**
   * Upload media
   * POST /api/media
   */
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }
      
      const file = req.file;
      const { altText, type } = req.body;
      const uploadedBy = req.admin._id;
      
      const media = await this.manageMediaUseCase.uploadMedia(file, uploadedBy, altText, type);
      
      // Return as array for frontend compatibility
      res.status(201).json({
        success: true,
        count: 1,
        data: [media]
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all media
   * GET /api/media
   */
  async getAll(req, res, next) {
    try {
      const { page, limit, type, sortBy, sortOrder } = req.query;
      const result = await this.manageMediaUseCase.getAllMedia({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        type,
        sortBy,
        sortOrder
      });
      
      res.json(Response.paginated(result.media, {
        total: result.total,
        page: result.page,
        limit: result.limit
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get media by ID
   * GET /api/media/:id
   */
  async getOne(req, res, next) {
    try {
      const media = await this.manageMediaUseCase.getMediaById(req.params.id);
      res.json(Response.success(media));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update media
   * PUT /api/media/:id
   */
  async update(req, res, next) {
    try {
      const media = await this.manageMediaUseCase.updateMedia(req.params.id, req.body);
      res.json(Response.success(media));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete media
   * DELETE /api/media/:id
   */
  async delete(req, res, next) {
    try {
      const result = await this.manageMediaUseCase.deleteMedia(req.params.id);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MediaController;

