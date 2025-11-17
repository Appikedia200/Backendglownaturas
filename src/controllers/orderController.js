const mongoose = require('mongoose');
const Order = require('../infrastructure/database/mongodb/models/Order');
const Product = require('../infrastructure/database/mongodb/models/Product');
const { generateOrderId, calculateShippingFee } = require('../utils/helpers');
const { sendOrderEmail } = require('../utils/emailService');
const { generatePDFReceipt } = require('../utils/pdfGenerator');
const { sanitizeSearchQuery } = require('../utils/searchHelper');
const { validatePagination, buildPaginatedResponse } = require('../utils/paginationHelper');
const logger = require('../config/logger');

// Create new order with MongoDB transactions to prevent race conditions
exports.createOrder = async (req, res, next) => {
  // Start a MongoDB session for transaction support
  const session = await mongoose.startSession();
  
  try {
    // Start transaction
    await session.startTransaction();
    
    const { customer, items, paymentMethod, notes } = req.body;
    
    // Calculate totals and prepare order items
    let subtotal = 0;
    const orderItems = [];
    
    // Atomic stock validation and reservation
    for (const item of items) {
      // Use findOneAndUpdate with atomic operations to prevent race conditions
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          // Ensure available stock (stock - reservedStock) is sufficient
          $expr: {
            $gte: [
              { $subtract: ['$stock', '$reservedStock'] },
              item.quantity
            ]
          }
        },
        {
          // Atomically increment reserved stock
          $inc: { reservedStock: item.quantity }
        },
        {
          session, // Use transaction session
          new: true, // Return updated document
          runValidators: true
        }
      );
      
      if (!product) {
        // Stock check failed - product not found or insufficient stock
        const productDoc = await Product.findById(item.product).session(session);
        if (!productDoc) {
          throw new Error(`Product ${item.product} not found`);
        }
        throw new Error(
          `Insufficient stock for ${productDoc.name}. Available: ${productDoc.availableStock}, Requested: ${item.quantity}`
        );
      }
      
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
      
      logger.info(`Reserved ${item.quantity} units of ${product.name} (Transaction)`, {
        productId: product._id,
        availableStock: product.availableStock
      });
    }
    
    const shippingFee = calculateShippingFee(customer.city, customer.state);
    const total = subtotal + shippingFee;
    
    // Create order within transaction
    const order = await Order.create([{
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
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      statusHistory: [{
        status: 'pending',
        date: Date.now(),
        note: 'Order created - awaiting payment'
      }]
    }], { session }); // Note: create() with session requires array format
    
    // Commit transaction - all operations succeed or all fail
    await session.commitTransaction();
    
    logger.info(`Order created successfully: ${order[0].orderId} - Total: ₦${total}`, {
      orderId: order[0]._id,
      itemCount: items.length
    });
    
    // Send email AFTER transaction commits (outside transaction to avoid email delays)
    try {
      await sendOrderEmail(order[0], 'order_pending');
    } catch (emailError) {
      // Log email failure but don't fail the order
      logger.error(`Failed to send order confirmation email for ${order[0].orderId}: ${emailError.message}`);
    }
    
    res.status(201).json({
      success: true,
      data: order[0],
      message: 'Order created successfully. Please complete payment within 6 hours.'
    });
    
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    
    logger.error(`Order creation failed: ${error.message}`, {
      error: error.stack
    });
    
    // Return appropriate error message
    if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    next(error);
  } finally {
    // Always end the session
    session.endSession();
  }
};

// Confirm payment with MongoDB transaction to ensure atomic operations
exports.confirmPayment = async (req, res, next) => {
  // Start MongoDB session for transaction support
  const session = await mongoose.startSession();
  
  try {
    // Start transaction for atomic payment confirmation
    await session.startTransaction();
    
    const { id } = req.params;
    const { transactionReference, paidAmount, paymentProof } = req.body;
    
    // Fetch order with session to lock document
    const order = await Order.findById(id).populate('items.product').session(session);
    
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Check payment status to prevent double processing
    if (order.paymentStatus !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Payment already processed for this order',
        errorCode: 'PAYMENT_ALREADY_PROCESSED'
      });
    }
    
    // Check if order has expired
    if (order.expiresAt && order.expiresAt < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Order has expired. Reserved stock has been released.',
        errorCode: 'ORDER_EXPIRED'
      });
    }
    
    // Atomically deduct stock for all items
    for (const item of order.items) {
      const product = await Product.findById(item.product._id).session(session);
      
      // Validate product still exists
      if (!product) {
        throw new Error(`Product ${item.productName} no longer exists`);
      }
      
      // Validate reserved stock is available
      if (product.reservedStock < item.quantity) {
        throw new Error(`Insufficient reserved stock for ${product.name}. Expected: ${item.quantity}, Available: ${product.reservedStock}`);
      }
      
      // Atomically confirm stock deduction (deduct from both reservedStock and stock)
      await product.confirmStockDeduction(item.quantity);
      
      logger.info(`Stock deducted atomically: ${item.quantity} units of ${product.name} for order ${order.orderId}`, {
        orderId: order._id,
        productId: product._id,
        quantity: item.quantity,
        transaction: true
      });
    }
    
    // Update order payment details within transaction
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
    
    await order.save({ session });
    
    // Commit transaction - all operations succeed or all fail
    await session.commitTransaction();
    
    logger.info(`Payment confirmed successfully: ${order.orderId} - Total: ${order.total}`, {
      orderId: order._id,
      transactionReference: transactionReference,
      itemCount: order.items.length
    });
    
    // Generate PDF receipt AFTER transaction commits (non-blocking)
    let pdfPath;
    try {
      pdfPath = await generatePDFReceipt(order);
    } catch (pdfError) {
      // Log PDF generation failure but don't fail the payment
      logger.error(`PDF generation failed for order ${order.orderId}: ${pdfError.message}`);
    }
    
    // Send payment confirmed email AFTER transaction commits (non-blocking)
    try {
      await sendOrderEmail(order, 'payment_confirmed', pdfPath);
    } catch (emailError) {
      // Log email failure but don't fail the payment
      logger.error(`Payment confirmation email failed for ${order.orderId}: ${emailError.message}`);
    }
    
    res.json({
      success: true,
      data: order,
      message: 'Payment confirmed and stock deducted successfully'
    });
    
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    
    logger.error(`Payment confirmation failed: ${error.message}`, {
      orderId: id,
      error: error.stack,
      transaction: 'rolled_back'
    });
    
    // Return appropriate error based on type
    if (error.message.includes('Insufficient reserved stock') || error.message.includes('no longer exists')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        errorCode: 'STOCK_VALIDATION_FAILED'
      });
    }
    
    next(error);
  } finally {
    // Always end the session
    session.endSession();
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
    
    // Validate text inputs
    if (customMessage && customMessage.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Custom message is too long. Maximum 500 characters.'
      });
    }
    
    if (internalNote && internalNote.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Internal note is too long. Maximum 1000 characters.'
      });
    }
    
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
    
    if (reason && reason.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Cancellation reason is too long. Maximum length is 500 characters.'
      });
    }
    
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
    
    // Search by order ID or customer name/email (ReDoS protected)
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search, 100);
      
      if (!sanitizedSearch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid search query. Must be 1-100 characters.',
          errorCode: 'INVALID_SEARCH_QUERY'
        });
      }
      
      query.$or = [
        { orderId: { $regex: sanitizedSearch, $options: 'i' } },
        { 'customer.name': { $regex: sanitizedSearch, $options: 'i' } },
        { 'customer.email': { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Validate and sanitize pagination parameters
    const { page: validPage, limit: validLimit, skip } = validatePagination(req.query);
    
    const orders = await Order.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(validLimit)
      .populate('items.product', 'name slug images')
      .select('-__v')
      .lean(); // Returns plain JavaScript objects (faster, less memory)
    
    const total = await Order.countDocuments(query);
    
    // Build standard paginated response
    const response = buildPaginatedResponse(orders, total, validPage, validLimit);
    res.json(response);
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
    
    // Validate note input
    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Note is required and must be a non-empty string'
      });
    }
    
    if (note.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Note is too long. Maximum length is 2000 characters.'
      });
    }
    
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
      .populate('items.product', 'name sku')
      .lean(); // Much faster for large exports
    
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
/**
 * Sanitize CSV cell to prevent formula injection
 * Protects against CSV injection attacks by prefixing dangerous characters
 * 
 * @param {*} value - Cell value to sanitize
 * @returns {string} Sanitized cell value
 */
function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // Prevent formula injection - prepend single quote to dangerous characters
  // Dangerous chars: = + - @ \t \r (can execute formulas in Excel/Calc)
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some(char => stringValue.startsWith(char))) {
    return `'${stringValue}`;
  }
  
  // Escape quotes and wrap in quotes if contains comma, quotes, or newlines
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Generate CSV export of orders with formula injection protection
 * 
 * @param {Array} orders - Array of order documents
 * @returns {string} CSV string with sanitized data
 */
function generateOrdersCSV(orders) {
  const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Items', 'Total', 'Payment Status', 'Order Status'];
  
  const rows = orders.map(order => [
    sanitizeCsvCell(order.orderId),
    sanitizeCsvCell(order.createdAt.toLocaleDateString()),
    sanitizeCsvCell(order.customer.name),
    sanitizeCsvCell(order.customer.email),
    sanitizeCsvCell(order.items.length),
    sanitizeCsvCell(order.total),
    sanitizeCsvCell(order.paymentStatus),
    sanitizeCsvCell(order.status)
  ]);
  
  // Sanitize headers as well
  return [headers.map(sanitizeCsvCell), ...rows]
    .map(row => row.join(','))
    .join('\n');
}

