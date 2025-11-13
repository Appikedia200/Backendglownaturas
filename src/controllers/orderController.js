const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const { generateOrderId, calculateShippingFee } = require('../utils/helpers');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../utils/emailService');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, customer } = req.body;
    
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.product}`
        });
      }
      
      if (product.trackInventory && product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`
        });
      }
      
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      });
      
      if (product.trackInventory) {
        product.stock -= item.quantity;
        product.orderCount += 1;
        await product.save();
      }
    }
    
    const shippingFee = calculateShippingFee(customer.city, customer.state);
    const total = subtotal + shippingFee;
    
    const orderId = generateOrderId();
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
    
    const order = await Order.create({
      orderId,
      customer,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod: req.body.paymentMethod || 'bank_transfer',
      expiresAt,
      statusHistory: [{
        status: 'pending',
        date: Date.now(),
        by: 'System'
      }]
    });
    
    const settings = await Settings.findOne({ singleton: true });
    if (settings) {
      await sendOrderConfirmationEmail(order, settings);
    }
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (req.query.status) query.status = req.query.status;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    if (req.query.paymentMethod) query.paymentMethod = req.query.paymentMethod;
    if (req.query.email) query['customer.email'] = req.query.email;
    if (req.query.orderId) query.orderId = new RegExp(req.query.orderId, 'i');
    
    const orders = await Order.find(query)
      .populate('items.product', 'name slug')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name slug images');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    order.status = status;
    order.statusHistory.push({
      status,
      date: Date.now(),
      by: req.admin.name,
      note
    });
    
    await order.save();
    
    const settings = await Settings.findOne({ singleton: true });
    if (settings && ['processing', 'shipped', 'delivered'].includes(status)) {
      await sendOrderStatusEmail(order, status, settings);
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: req.body.paymentStatus },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTrackingNumber = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingNumber: req.body.trackingNumber },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    await order.deleteOne();
    
    res.json({
      success: true,
      message: 'Order deleted'
    });
  } catch (error) {
    next(error);
  }
};

