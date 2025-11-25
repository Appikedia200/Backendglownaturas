/**
 * Homepage Section HTTP Controller
 * Handles HTTP requests for homepage sections - NO business logic
 * @version 5.2.0
 */

const Response = require('../../../shared/utils/Response');

class HomepageSectionController {
  /**
   * @param {ManageHomepageSectionsUseCase} manageHomepageSectionsUseCase
   */
  constructor(manageHomepageSectionsUseCase) {
    this.manageHomepageSectionsUseCase = manageHomepageSectionsUseCase;
  }

  /**
   * Get all homepage sections
   * GET /api/homepage-sections
   */
  async getAll(req, res, next) {
    try {
      const { isActive } = req.query;
      const filters = {};
      
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }
      
      const sections = await this.manageHomepageSectionsUseCase.getAllSections(filters);
      res.json(Response.success(sections));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get section by type
   * GET /api/homepage-sections/:type
   */
  async getOne(req, res, next) {
    try {
      const { type } = req.params;
      const section = await this.manageHomepageSectionsUseCase.getSectionByType(type);
      res.json(Response.success(section));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create section
   * POST /api/homepage-sections
   */
  async create(req, res, next) {
    try {
      const section = await this.manageHomepageSectionsUseCase.createSection({
        ...req.body,
        updatedBy: req.admin._id
      });
      res.status(201).json(Response.created(section));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update section
   * PUT /api/homepage-sections/:type
   */
  async update(req, res, next) {
    try {
      const { type } = req.params;
      const section = await this.manageHomepageSectionsUseCase.updateSection(type, {
        ...req.body,
        updatedBy: req.admin._id
      });
      res.json(Response.success(section));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete section
   * DELETE /api/homepage-sections/:type
   */
  async delete(req, res, next) {
    try {
      const { type } = req.params;
      const result = await this.manageHomepageSectionsUseCase.deleteSection(type);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add products to section
   * POST /api/homepage-sections/:type/products
   */
  async addProducts(req, res, next) {
    try {
      const { type } = req.params;
      const { productIds } = req.body;
      
      if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({
          success: false,
          error: 'Product IDs are required and must be an array'
        });
      }
      
      const section = await this.manageHomepageSectionsUseCase.addProducts(type, productIds);
      res.json(Response.success(section));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove products from section
   * DELETE /api/homepage-sections/:type/products
   */
  async removeProducts(req, res, next) {
    try {
      const { type } = req.params;
      const { productIds } = req.body;
      
      if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({
          success: false,
          error: 'Product IDs are required and must be an array'
        });
      }
      
      const section = await this.manageHomepageSectionsUseCase.removeProducts(type, productIds);
      res.json(Response.success(section));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder products in section
   * PUT /api/homepage-sections/:type/reorder
   */
  async reorderProducts(req, res, next) {
    try {
      const { type } = req.params;
      const { productIds } = req.body;
      
      if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({
          success: false,
          error: 'Product IDs are required and must be an array'
        });
      }
      
      const section = await this.manageHomepageSectionsUseCase.reorderProducts(type, productIds);
      res.json(Response.success(section));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle section active status
   * PATCH /api/homepage-sections/:type/toggle
   */
  async toggleActive(req, res, next) {
    try {
      const { type } = req.params;
      const section = await this.manageHomepageSectionsUseCase.toggleActive(type);
      res.json(Response.success(section));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HomepageSectionController;

