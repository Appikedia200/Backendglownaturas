const Response = require('../../../shared/utils/Response');

/**
 * Category HTTP Controller
 * Handles HTTP concerns ONLY - no business logic
 * @version 5.1.0
 */
class CategoryController {
  /**
   * @param {ManageCategoriesUseCase} manageCategoriesUseCase
   */
  constructor(manageCategoriesUseCase) {
    this.manageCategoriesUseCase = manageCategoriesUseCase;
  }

  async getAll(req, res, next) {
    try {
      const categories = await this.manageCategoriesUseCase.getAll();
      // Return in expected format: { categories: [...] }
      res.json(Response.success({ categories }));
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const category = await this.manageCategoriesUseCase.getById(req.params.id);
      res.json(Response.success(category));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const category = await this.manageCategoriesUseCase.create(req.body);
      res.status(201).json(Response.created(category));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await this.manageCategoriesUseCase.update(req.params.id, req.body);
      res.json(Response.success(category));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.manageCategoriesUseCase.delete(req.params.id);
      res.json(Response.success({ message: 'Category deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;

