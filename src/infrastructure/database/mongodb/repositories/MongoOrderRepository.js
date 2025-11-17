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
}

module.exports = MongoOrderRepository;

