/**
 * Dashboard HTTP Controller
 * Handles HTTP requests for dashboard - NO business logic
 * @version 5.1.0
 */

const Response = require('../../../shared/utils/Response');

class DashboardController {
  /**
   * @param {GetStatisticsUseCase} getStatisticsUseCase
   */
  constructor(getStatisticsUseCase) {
    this.getStatisticsUseCase = getStatisticsUseCase;
  }

  /**
   * Get dashboard statistics
   * GET /api/dashboard/statistics
   */
  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const statistics = await this.getStatisticsUseCase.execute({ startDate, endDate });
      res.json(Response.success(statistics));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;

