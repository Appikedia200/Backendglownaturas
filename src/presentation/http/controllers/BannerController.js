const Response = require('../../../shared/utils/Response');

/**
 * Banner HTTP Controller
 * Handles HTTP concerns ONLY - no business logic
 * @version 1.0.0
 */
class BannerController {
  /**
   * @param {ManageBannersUseCase} manageBannersUseCase
   */
  constructor(manageBannersUseCase) {
    this.manageBannersUseCase = manageBannersUseCase;
  }

  /**
   * Get all banner sections
   * GET /api/banners
   */
  async getAll(req, res, next) {
    try {
      const { activeOnly } = req.query;
      const options = {
        activeOnly: activeOnly === 'true'
      };

      const banners = await this.manageBannersUseCase.getAll(options);
      res.json(Response.success(banners));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get banner by section
   * GET /api/banners/:section
   */
  async getBySection(req, res, next) {
    try {
      const { section } = req.params;
      const banner = await this.manageBannersUseCase.getBySection(section);

      if (!banner) {
        return res.status(404).json(Response.error('Banner section not found', 404));
      }

      res.json(Response.success(banner));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new banner section
   * POST /api/banners
   */
  async create(req, res, next) {
    try {
      const banner = await this.manageBannersUseCase.create(req.body);
      res.status(201).json(Response.created(banner));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update banner section
   * PUT /api/banners/:section
   */
  async update(req, res, next) {
    try {
      const { section } = req.params;
      const banner = await this.manageBannersUseCase.update(section, req.body);
      res.json(Response.success(banner));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete banner section
   * DELETE /api/banners/:section
   */
  async delete(req, res, next) {
    try {
      const { section } = req.params;
      await this.manageBannersUseCase.delete(section);
      res.json(Response.success({ message: 'Banner section deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add image to banner section
   * POST /api/banners/:section/images
   */
  async addImage(req, res, next) {
    try {
      const { section } = req.params;
      const banner = await this.manageBannersUseCase.addImage(section, req.body);
      res.status(201).json(Response.created(banner));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove image from banner section
   * DELETE /api/banners/:section/images/:mediaId
   */
  async removeImage(req, res, next) {
    try {
      const { section, mediaId } = req.params;
      const banner = await this.manageBannersUseCase.removeImage(section, mediaId);
      res.json(Response.success(banner));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder images in banner section
   * PUT /api/banners/:section/images/reorder
   */
  async reorderImages(req, res, next) {
    try {
      const { section } = req.params;
      const { imageIds } = req.body;
      const banner = await this.manageBannersUseCase.reorderImages(section, imageIds);
      res.json(Response.success(banner));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BannerController;
