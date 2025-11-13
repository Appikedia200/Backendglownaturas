const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Admin = require('../models/Admin');

exports.getStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const lowStockProducts = await Product.countDocuments({
      trackInventory: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });
    
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: 'pending' });
    
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    
    const revenueData = await Order.aggregate([
      {
        $match: { paymentStatus: 'paid' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    
    const revenue = revenueData.length > 0 ? revenueData[0] : { totalRevenue: 0, totalOrders: 0 };
    
    res.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          completed: completedOrders
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts
        },
        reviews: {
          total: totalReviews,
          pending: pendingReviews
        },
        admins: {
          total: totalAdmins,
          active: activeAdmins
        },
        revenue: {
          total: revenue.totalRevenue,
          paidOrders: revenue.totalOrders
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecentOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const orders = await Order.find()
      .populate('items.product', 'name')
      .sort('-createdAt')
      .limit(limit);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const products = await Product.find({ status: 'active' })
      .populate('category', 'name')
      .sort('-orderCount')
      .limit(limit);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.getSalesData = async (req, res, next) => {
  try {
    const { period } = req.query;
    
    let matchDate = {};
    const now = new Date();
    
    if (period === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      matchDate = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      matchDate = { createdAt: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      matchDate = { createdAt: { $gte: yearAgo } };
    }
    
    const salesData = await Order.aggregate([
      {
        $match: { ...matchDate, paymentStatus: 'paid' }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    next(error);
  }
};

