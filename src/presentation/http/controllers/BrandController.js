/**
 * Brand Controller
 * Handles HTTP requests for brand endpoints
 * @version 5.2.1
 */

const Response = require('../../../shared/utils/Response');

class BrandController {
  constructor(manageBrandsUseCase) {
    this.manageBrandsUseCase = manageBrandsUseCase;
  }

  /**
   * GET /api/brands
   * Get all brands with optional filtering
   */
  async getAllBrands(req, res, next) {
    try {
      const { search, limit, page } = req.query;
      
      const options = {
        search,
        limit: limit ? parseInt(limit) : 1000,
        page: page ? parseInt(page) : 1,
        sortBy: 'name',
        sortOrder: 'asc'
      };

      const result = await this.manageBrandsUseCase.getAllBrands(options);
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/brands/:slug
   * Get single brand by slug
   */
  async getBrandBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const brand = await this.manageBrandsUseCase.getBrandBySlug(slug);
      res.json(Response.success(brand));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/brands/letter/:letter
   * Get brands starting with specific letter
   */
  async getBrandsByLetter(req, res, next) {
    try {
      const { letter } = req.params;
      const brands = await this.manageBrandsUseCase.getBrandsByLetter(letter);
      res.json(Response.success(brands));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/brands
   * Create new brand (Admin only)
   */
  async createBrand(req, res, next) {
    try {
      const brand = await this.manageBrandsUseCase.createBrand(req.body);
      res.status(201).json(Response.success(brand, 'Brand created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/brands/:id
   * Update brand (Admin only)
   */
  async updateBrand(req, res, next) {
    try {
      const { id } = req.params;
      const brand = await this.manageBrandsUseCase.updateBrand(id, req.body);
      res.json(Response.success(brand, 'Brand updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/brands/:id
   * Delete brand (Admin only)
   */
  async deleteBrand(req, res, next) {
    try {
      const { id } = req.params;
      await this.manageBrandsUseCase.deleteBrand(id);
      res.json(Response.success(null, 'Brand deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/brands/sync
   * Sync brands from products (Admin only)
   */
  async syncBrands(req, res, next) {
    try {
      const result = await this.manageBrandsUseCase.syncBrandsFromProducts();
      res.json(Response.success(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BrandController;

