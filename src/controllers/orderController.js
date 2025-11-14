const Order = require('../models/Order');
const Product = require('../models/Product');
const { generateOrderId, calculateShippingFee } = require('../utils/helpers');
const { sendOrderEmail } = require('../utils/emailService');
const { generatePDFReceipt } = require('../utils/pdfGenerator');
const logger = require('../config/logger');

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, paymentMethod, notes } = req.body;
    
    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product ${item.product} not found`
        });
      }
      
      if (product.availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.availableStock}`
        });
      }
    }
    
    // Calculate totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      });
    }
    
    const shippingFee = calculateShippingFee(customer.city, customer.state);
    const total = subtotal + shippingFee;
    
    // Create order
    const order = await Order.create({
      orderId: generateOrderId(),
      customer,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      notes: {
        customer: notes?.customer || ''
      },
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      statusHistory: [{
        status: 'pending',
        date: Date.now(),
        note: 'Order created - awaiting payment'
      }]
    });
    
    // Reserve stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      await product.reserveStock(item.quantity);
      logger.info(`Reserved ${item.quantity} units of ${product.name} for order ${order.orderId}`);
    }
    
    // Send payment pending email
    await sendOrderEmail(order, 'order_pending');
    
    logger.info(`Order created: ${order.orderId} - Total: ₦${total}`);
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully. Please complete payment within 6 hours.'
    });
  } catch (error) {
    logger.error(`Order creation failed: ${error.message}`);
    next(error);
  }
};

// Confirm payment
exports.confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transactionReference, paidAmount, paymentProof } = req.body;
    
    const order = await Order.findById(id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Payment already processed'
      });
    }
    
    // Update payment details
    order.paymentStatus = 'paid';
    order.status = 'processing';
    order.paymentDetails = {
      transactionReference: transactionReference || order.orderId,
      paidAmount: paidAmount || order.total,
      paidAt: Date.now(),
      paymentProof
    };
    order.statusHistory.push({
      status: 'processing',
      date: Date.now(),
      by: req.admin.name,
      note: 'Payment confirmed by admin'
    });
    
    await order.save();
    
    // Deduct stock (payment confirmed!)
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      await product.confirmStockDeduction(item.quantity);
      logger.info(`Deducted ${item.quantity} units of ${product.name} for paid order ${order.orderId}`);
    }
    
    // Generate PDF receipt
    const pdfPath = await generatePDFReceipt(order);
    
    // Send payment confirmed email with PDF
    await sendOrderEmail(order, 'payment_confirmed', pdfPath);
    
    logger.info(`Payment confirmed for order: ${order.orderId}`);
    
    res.json({
      success: true,
      data: order,
      message: 'Payment confirmed and stock deducted'
    });
  } catch (error) {
    logger.error(`Payment confirmation failed: ${error.message}`);
    next(error);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      deliveryMethod,
      carrier,
      trackingNumber,
      trackingUrl,
      riderContact,
      customMessage,
      estimatedDelivery,
      internalNote
    } = req.body;
    
    const order = await Order.findById(id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    const oldStatus = order.status;
    order.status = status;
    
    // Update shipping details if status is shipped
    if (status === 'shipped') {
      order.shipping = {
        method: deliveryMethod,
        carrier,
        trackingNumber,
        trackingUrl,
        riderContact,
        customMessage,
        estimatedDelivery,
        shippedAt: Date.now()
      };
      
      // Select appropriate email template
      let templateType;
      if (deliveryMethod === 'local_delivery') {
        templateType = 'order_shipped_local';
      } else if (deliveryMethod === 'pickup') {
        templateType = 'order_shipped_pickup';
      } else {
        templateType = 'order_shipped_courier';
      }
      
      await sendOrderEmail(order, templateType);
      
    } else if (status === 'delivered') {
      order.shipping.deliveredAt = Date.now();
      await sendOrderEmail(order, 'order_delivered');
    }
    
    // Add to status history
    order.statusHistory.push({
      status,
      date: Date.now(),
      by: req.admin.name,
      note: internalNote || `Status changed from ${oldStatus} to ${status}`
    });
    
    // Update internal notes if provided
    if (internalNote) {
      order.notes.internal = (order.notes.internal || '') + '\n' + `[${new Date().toLocaleString()}] ${req.admin.name}: ${internalNote}`;
    }
    
    await order.save();
    
    logger.info(`Order ${order.orderId} status updated to ${status} by ${req.admin.name}`);
    
    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    logger.error(`Update order status failed: ${error.message}`);
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findById(id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel delivered orders'
      });
    }
    
    // Release reserved stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.releaseStock(item.quantity);
        logger.info(`Released ${item.quantity} units of ${product.name} from cancelled order ${order.orderId}`);
      }
    }
    
    order.status = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancelReason = reason || 'Cancelled by admin';
    order.statusHistory.push({
      status: 'cancelled',
      date: Date.now(),
      by: req.admin ? req.admin.name : 'System',
      note: reason || 'Order cancelled'
    });
    
    await order.save();
    await sendOrderEmail(order, 'order_cancelled');
    
    logger.info(`Order cancelled: ${order.orderId}`);
    
    res.json({
      success: true,
      data: order,
      message: 'Order cancelled and stock released'
    });
  } catch (error) {
    logger.error(`Order cancellation failed: ${error.message}`);
    next(error);
  }
};

// Get all orders with advanced filtering
exports.getAllOrders = async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = '-createdAt'
    } = req.query;
    
    let query = {};
    
    // Status filters
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    // Search by order ID or customer name/email
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name slug images')
      .select('-__v');
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    logger.error(`Get orders failed: ${error.message}`);
    next(error);
  }
};

// Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name slug images sku')
      .populate('refund.processedBy', 'name email');
    
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
    logger.error(`Get order failed: ${error.message}`);
    next(error);
  }
};

// Add internal note to order
exports.addOrderNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    const timestamp = new Date().toLocaleString();
    const noteEntry = `[${timestamp}] ${req.admin.name}: ${note}`;
    
    order.notes.internal = (order.notes.internal || '') + '\n' + noteEntry;
    await order.save();
    
    logger.info(`Note added to order ${order.orderId} by ${req.admin.name}`);
    
    res.json({
      success: true,
      data: order,
      message: 'Note added successfully'
    });
  } catch (error) {
    logger.error(`Add order note failed: ${error.message}`);
    next(error);
  }
};

// Request refund
exports.requestRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot refund unpaid order'
      });
    }
    
    order.refund = {
      status: 'requested',
      amount: amount || order.total,
      reason,
      requestedAt: Date.now()
    };
    
    await order.save();
    
    logger.info(`Refund requested for order ${order.orderId}`);
    
    res.json({
      success: true,
      data: order,
      message: 'Refund requested'
    });
  } catch (error) {
    logger.error(`Request refund failed: ${error.message}`);
    next(error);
  }
};

// Process refund
exports.processRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    const order = await Order.findById(id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (order.refund.status !== 'requested') {
      return res.status(400).json({
        success: false,
        error: 'No pending refund request'
      });
    }
    
    order.refund.status = status;
    order.refund.processedAt = Date.now();
    order.refund.processedBy = req.admin._id;
    
    if (status === 'approved' || status === 'completed') {
      order.paymentStatus = order.refund.amount === order.total ? 'refunded' : 'partially_refunded';
      
      // Restore stock if refund approved
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
          logger.info(`Restored ${item.quantity} units of ${product.name} from refunded order ${order.orderId}`);
        }
      }
    }
    
    order.statusHistory.push({
      status: 'refund_' + status,
      date: Date.now(),
      by: req.admin.name,
      note: note || `Refund ${status}`
    });
    
    await order.save();
    
    logger.info(`Refund ${status} for order ${order.orderId} by ${req.admin.name}`);
    
    res.json({
      success: true,
      data: order,
      message: `Refund ${status}`
    });
  } catch (error) {
    logger.error(`Process refund failed: ${error.message}`);
    next(error);
  }
};

// Export orders to CSV
exports.exportOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.product', 'name sku');
    
    // Generate CSV
    const csv = generateOrdersCSV(orders);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${Date.now()}.csv`);
    res.send(csv);
    
    logger.info(`Orders exported by ${req.admin.name}`);
  } catch (error) {
    logger.error(`Export orders failed: ${error.message}`);
    next(error);
  }
};

// Helper function to generate CSV
function generateOrdersCSV(orders) {
  const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Items', 'Total', 'Payment Status', 'Order Status'];
  const rows = orders.map(order => [
    order.orderId,
    order.createdAt.toLocaleDateString(),
    order.customer.name,
    order.customer.email,
    order.items.length,
    order.total,
    order.paymentStatus,
    order.status
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
