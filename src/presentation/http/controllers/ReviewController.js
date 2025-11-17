const Response = require('../../../shared/utils/Response');

/**
 * Review HTTP Controller
 * Handles HTTP concerns ONLY - no business logic
 * @version 5.1.0
 */
class ReviewController {
  /**
   * @param {ManageReviewsUseCase} manageReviewsUseCase
   */
  constructor(manageReviewsUseCase) {
    this.manageReviewsUseCase = manageReviewsUseCase;
  }

  async getAll(req, res, next) {
    try {
      const { reviews, total, page, limit } = await this.manageReviewsUseCase.getAll(req.query);
      res.json(Response.paginated(reviews, { total, page, limit }));
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const review = await this.manageReviewsUseCase.getById(req.params.id);
      res.json(Response.success(review));
    } catch (error) {
      next(error);
    }
  }

  async getByProduct(req, res, next) {
    try {
      const { reviews, total, page, limit } = await this.manageReviewsUseCase.getByProduct(
        req.params.productId,
        req.query
      );
      res.json(Response.paginated(reviews, { total, page, limit }));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const review = await this.manageReviewsUseCase.updateStatus(
        req.params.id,
        req.body.status
      );
      res.json(Response.success(review));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.manageReviewsUseCase.delete(req.params.id);
      res.json(Response.success({ message: 'Review deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;

