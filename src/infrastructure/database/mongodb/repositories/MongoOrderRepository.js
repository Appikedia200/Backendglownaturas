const IOrderRepository = require('../../../../domain/repositories/IOrderRepository');
const Order = require('../models/Order');
const { NotFoundError } = require('../../../../shared/errors/AppError');

/**
 * MongoDB Order Repository Implementation (Adapter)
 * Implements IOrderRepository using Mongoose
 * @version 5.1.0
 */
class MongoOrderRepository extends IOrderRepository {
  async findById(id) {
    const order = await Order.findById(id)
      .populate('items.product')
      .lean();
    
    if (!order) {
      throw new NotFoundError('Order');
    }
    
    return order;
  }

  async findByOrderId(orderId) {
    const order = await Order.findOne({ orderId })
      .populate('items.product')
      .lean();
    
    if (!order) {
      throw new NotFoundError('Order');
    }
    
    return order;
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Execute query with pagination
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return { orders, total };
  }

  async create(orderData) {
    const order = await Order.create(orderData);
    return await Order.findById(order._id)
      .populate('items.product')
      .lean();
  }

  async update(id, updates) {
    const order = await Order.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('items.product');
    
    if (!order) {
      throw new NotFoundError('Order');
    }
    
    return order;
  }

  async updateStatus(id, status) {
    return await this.update(id, { status });
  }

  async updatePaymentStatus(id, paymentStatus) {
    return await this.update(id, { paymentStatus });
  }

  async addNote(id, note) {
    const order = await Order.findByIdAndUpdate(
      id,
      { $push: { notes: note } },
      { new: true, runValidators: true }
    ).populate('items.product');
    
    if (!order) {
      throw new NotFoundError('Order');
    }
    
    return order;
  }

  async findExpired() {
    return await Order.find({
      status: 'pending',
      paymentStatus: 'pending',
      expiresAt: { $lt: new Date() },
    }).lean();
  }

  async getStatistics() {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus: stats,
    };
  }

  /**
   * Count orders with optional filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    const query = {};
    if (filter.$gte || filter.$lte) {
      query.createdAt = filter;
    }
    return await Order.countDocuments(query);
  }

  /**
   * Get total revenue with optional date filter
   * @param {Object} dateFilter - Date filter object
   * @returns {Promise<number>}
   */
  async getTotalRevenue(dateFilter = {}) {
    const match = { paymentStatus: 'paid' };
    if (dateFilter.$gte || dateFilter.$lte) {
      match.createdAt = dateFilter;
    }
    
    const result = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    return result[0]?.total || 0;
  }

  /**
   * Count orders by status
   * @param {string} status - Order status
   * @returns {Promise<number>}
   */
  async countByStatus(status) {
    return await Order.countDocuments({ status });
  }

  /**
   * Count orders by payment status with optional date filter
   * @param {string} paymentStatus - Payment status
   * @param {Object} dateFilter - Date filter object
   * @returns {Promise<number>}
   */
  async countByPaymentStatus(paymentStatus, dateFilter = {}) {
    const query = { paymentStatus };
    if (dateFilter.$gte || dateFilter.$lte) {
      query.createdAt = dateFilter;
    }
    return await Order.countDocuments(query);
  }

  /**
   * Get average order value with optional date filter
   * @param {Object} dateFilter - Date filter object
   * @returns {Promise<number>}
   */
  async getAverageOrderValue(dateFilter = {}) {
    const match = { paymentStatus: 'paid' };
    if (dateFilter.$gte || dateFilter.$lte) {
      match.createdAt = dateFilter;
    }
    
    const result = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, avgValue: { $avg: '$total' } } }
    ]);
    
    return result[0]?.avgValue || 0;
  }

  /**
   * Get total items sold with optional date filter
   * @param {Object} dateFilter - Date filter object
   * @returns {Promise<number>}
   */
  async getTotalItemsSold(dateFilter = {}) {
    const match = { paymentStatus: 'paid' };
    if (dateFilter.$gte || dateFilter.$lte) {
      match.createdAt = dateFilter;
    }
    
    const result = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: null, totalQty: { $sum: '$items.quantity' } } }
    ]);
    
    return result[0]?.totalQty || 0;
  }

  /**
   * Get revenue over time grouped by period
   * @param {Object} dateFilter - Date filter object
   * @param {string} groupBy - Group by day, week, or month
   * @returns {Promise<Array>}
   */
  async getRevenueOverTime(dateFilter = {}, groupBy = 'day') {
    const match = { paymentStatus: 'paid' };
    if (dateFilter.$gte || dateFilter.$lte) {
      match.createdAt = dateFilter;
    }

    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%V';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const result = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
          orders: 1
        }
      }
    ]);

    return result;
  }

  /**
   * Get top selling products
   * @param {Object} dateFilter - Date filter object
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>}
   */
  async getTopProducts(dateFilter = {}, limit = 5) {
    const match = { paymentStatus: 'paid' };
    if (dateFilter.$gte || dateFilter.$lte) {
      match.createdAt = dateFilter;
    }

    const result = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$productInfo.name',
          totalSold: 1,
          revenue: 1,
          image: { $arrayElemAt: ['$productInfo.images', 0] }
        }
      }
    ]);

    return result;
  }

  /**
   * Get sales by category
   * @param {Object} dateFilter - Date filter object
   * @returns {Promise<Array>}
   */
  async getSalesByCategory(dateFilter = {}) {
    const match = { paymentStatus: 'paid' };
    if (dateFilter.$gte || dateFilter.$lte) {
      match.createdAt = dateFilter;
    }

    const result = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo._id',
          categoryName: { $first: '$categoryInfo.name' },
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          itemsSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSales: -1 } },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: { $ifNull: ['$categoryName', 'Uncategorized'] },
          totalSales: 1,
          itemsSold: 1
        }
      }
    ]);

    return result;
  }

  /**
   * Get orders for export
   * @param {Object} dateFilter - Date filter object
   * @returns {Promise<Array>}
   */
  async getOrdersForExport(dateFilter = {}) {
    const query = {};
    if (dateFilter.$gte || dateFilter.$lte) {
      query.createdAt = dateFilter;
    }

    const orders = await Order.find(query)
      .populate('customer.userId', 'name email')
      .select('orderNumber customer total paymentStatus status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return orders.map(order => ({
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || 'Guest',
      customerEmail: order.customer?.email || '',
      total: order.total,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      date: order.createdAt
    }));
  }

  /**
   * Get revenue data for export
   * @param {Object} dateFilter - Date filter object
   * @returns {Promise<Array>}
   */
  async getRevenueForExport(dateFilter = {}) {
    return await this.getRevenueOverTime(dateFilter, 'day');
  }
}

module.exports = MongoOrderRepository;

