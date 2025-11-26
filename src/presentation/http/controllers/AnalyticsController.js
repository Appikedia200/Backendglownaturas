/**
 * Analytics HTTP Controller
 * Handles HTTP requests for analytics - NO business logic
 * @version 5.2.1
 */

const Response = require('../../../shared/utils/Response');

class AnalyticsController {
  constructor(
    getAnalyticsSummaryUseCase,
    getRevenueOverTimeUseCase,
    getTopProductsUseCase,
    getSalesByCategoryUseCase,
    exportAnalyticsUseCase
  ) {
    this.getAnalyticsSummaryUseCase = getAnalyticsSummaryUseCase;
    this.getRevenueOverTimeUseCase = getRevenueOverTimeUseCase;
    this.getTopProductsUseCase = getTopProductsUseCase;
    this.getSalesByCategoryUseCase = getSalesByCategoryUseCase;
    this.exportAnalyticsUseCase = exportAnalyticsUseCase;
  }

  /**
   * Get analytics summary
   * GET /api/analytics/summary
   */
  async getSummary(req, res, next) {
    try {
      const { from, to } = req.query;
      const summary = await this.getAnalyticsSummaryUseCase.execute({
        startDate: from,
        endDate: to
      });
      res.json(Response.success(summary));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue over time
   * GET /api/analytics/revenue
   */
  async getRevenue(req, res, next) {
    try {
      const { from, to, groupBy } = req.query;
      const data = await this.getRevenueOverTimeUseCase.execute({
        startDate: from,
        endDate: to,
        groupBy: groupBy || 'day'
      });
      res.json(Response.success(data));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top products
   * GET /api/analytics/top-products
   */
  async getTopProducts(req, res, next) {
    try {
      const { from, to, limit } = req.query;
      const data = await this.getTopProductsUseCase.execute({
        startDate: from,
        endDate: to,
        limit: limit ? parseInt(limit) : 5
      });
      res.json(Response.success(data));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales by category
   * GET /api/analytics/sales-by-category
   */
  async getSalesByCategory(req, res, next) {
    try {
      const { from, to } = req.query;
      const data = await this.getSalesByCategoryUseCase.execute({
        startDate: from,
        endDate: to
      });
      res.json(Response.success(data));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export analytics data
   * GET /api/analytics/export
   */
  async export(req, res, next) {
    try {
      const { from, to, type } = req.query;
      const exportData = await this.exportAnalyticsUseCase.execute({
        startDate: from,
        endDate: to,
        type: type || 'orders'
      });
      res.json(Response.success(exportData));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;

