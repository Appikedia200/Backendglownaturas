const Response = require('../../../shared/utils/Response');

/**
 * Product HTTP Controller
 * Handles HTTP concerns ONLY - no business logic
 * @version 5.1.0
 */
class ProductController {
  /**
   * @param {CreateProductUseCase} createProductUseCase
   * @param {UpdateProductUseCase} updateProductUseCase
   * @param {DeleteProductUseCase} deleteProductUseCase
   * @param {GetProductsUseCase} getProductsUseCase
   * @param {GetJewelryFiltersUseCase} getJewelryFiltersUseCase
   */
  constructor(createProductUseCase, updateProductUseCase, deleteProductUseCase, getProductsUseCase, getJewelryFiltersUseCase) {
    this.createProductUseCase = createProductUseCase;
    this.updateProductUseCase = updateProductUseCase;
    this.deleteProductUseCase = deleteProductUseCase;
    this.getProductsUseCase = getProductsUseCase;
    this.getJewelryFiltersUseCase = getJewelryFiltersUseCase;
  }

  /**
   * Create new product
   * POST /api/products
   */
  async create(req, res, next) {
    try {
      const product = await this.createProductUseCase.execute(req.body);
      res.status(201).json(Response.created(product));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all products with filters
   * GET /api/products
   */
  async getAll(req, res, next) {
    try {
      const { products, total, page, limit } = await this.getProductsUseCase.execute(req.query);
      res.json(Response.paginated(products, { total, page, limit }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single product
   * GET /api/products/:id
   */
  async getOne(req, res, next) {
    try {
      const product = await this.getProductsUseCase.executeById(req.params.id);
      res.json(Response.success(product));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   * PUT /api/products/:id
   */
  async update(req, res, next) {
    try {
      const product = await this.updateProductUseCase.execute(req.params.id, req.body);
      res.json(Response.success(product));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  async delete(req, res, next) {
    try {
      await this.deleteProductUseCase.execute(req.params.id);
      res.json(Response.success({ message: 'Product deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get low stock products
   * GET /api/products/low-stock
   */
  async getLowStock(req, res, next) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const products = await this.getProductsUseCase.executeLowStock(threshold);
      res.json(Response.success(products));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get jewelry filter options
   * GET /api/products/jewelry/filters
   */
  async getJewelryFilters(req, res, next) {
    try {
      const filters = await this.getJewelryFiltersUseCase.execute();
      res.json(Response.success(filters));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;

