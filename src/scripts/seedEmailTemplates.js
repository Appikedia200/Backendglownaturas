/**
 * Seed Default Email Templates
 * Run this once to populate the database with default email templates
 * Usage: node src/scripts/seedEmailTemplates.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const EmailTemplate = require('../infrastructure/database/mongodb/models/EmailTemplate');
const logger = require('../config/logger');

const defaultTemplates = [
  {
    templateType: 'order_pending',
    name: 'Order Received - Payment Pending',
    subject: 'Order Received - Payment Pending #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlowNatura</h1>
    </div>
    <div class="content">
      <h2>Order Received!</h2>
      <p>Hi {{customerName}},</p>
      <p>Thank you for your order. We have received your order and are waiting for payment confirmation.</p>
      <p><strong>Order Number:</strong> {{orderNumber}}</p>
      <p><strong>Total Amount:</strong> ₦{{totalAmount}}</p>
      <p>Once we confirm your payment, we will process your order immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 GlowNatura. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: 'Hi {{customerName}}, thank you for your order #{{orderNumber}}. Total: ₦{{totalAmount}}. Waiting for payment confirmation.',
    variables: [
      { name: 'customerName', description: 'Customer full name', example: 'John Doe' },
      { name: 'orderNumber', description: 'Order ID', example: 'ORD-2025-001' },
      { name: 'totalAmount', description: 'Total order amount', example: '45000' }
    ],
    isActive: true,
    isDefault: true
  },
  {
    templateType: 'payment_confirmed',
    name: 'Payment Confirmed',
    subject: 'Payment Confirmed - Order #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlowNatura</h1>
    </div>
    <div class="content">
      <h2>Payment Confirmed!</h2>
      <p>Hi {{customerName}},</p>
      <p>Great news! We have confirmed your payment for order #{{orderNumber}}.</p>
      <p>Your order is now being processed and will be shipped soon.</p>
      <p><strong>Order Total:</strong> ₦{{totalAmount}}</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 GlowNatura. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: 'Hi {{customerName}}, payment confirmed for order #{{orderNumber}}. Total: ₦{{totalAmount}}.',
    variables: [
      { name: 'customerName', description: 'Customer full name', example: 'John Doe' },
      { name: 'orderNumber', description: 'Order ID', example: 'ORD-2025-001' },
      { name: 'totalAmount', description: 'Total order amount', example: '45000' }
    ],
    isActive: true,
    isDefault: true
  },
  {
    templateType: 'order_shipped_courier',
    name: 'Order Shipped - Courier Delivery',
    subject: 'Your Order Has Been Shipped #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlowNatura</h1>
    </div>
    <div class="content">
      <h2>Your Order is On Its Way!</h2>
      <p>Hi {{customerName}},</p>
      <p>Your order #{{orderNumber}} has been shipped via courier.</p>
      <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
      <p><strong>Estimated Delivery:</strong> {{deliveryDate}}</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 GlowNatura. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: 'Hi {{customerName}}, your order #{{orderNumber}} has been shipped. Tracking: {{trackingNumber}}',
    variables: [
      { name: 'customerName', description: 'Customer full name', example: 'John Doe' },
      { name: 'orderNumber', description: 'Order ID', example: 'ORD-2025-001' },
      { name: 'trackingNumber', description: 'Courier tracking number', example: 'TRK123456' },
      { name: 'deliveryDate', description: 'Estimated delivery date', example: '3-5 business days' }
    ],
    isActive: true,
    isDefault: true
  },
  {
    templateType: 'order_shipped_local',
    name: 'Order Shipped - Local Delivery',
    subject: 'Your Order is Out for Delivery #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlowNatura</h1>
    </div>
    <div class="content">
      <h2>Your Order is Out for Delivery!</h2>
      <p>Hi {{customerName}},</p>
      <p>Your order #{{orderNumber}} is on its way to you.</p>
      <p>Our delivery team will contact you shortly.</p>
      <p><strong>Expected delivery:</strong> {{deliveryDate}}</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 GlowNatura. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: 'Hi {{customerName}}, your order #{{orderNumber}} is out for delivery. Expected: {{deliveryDate}}',
    variables: [
      { name: 'customerName', description: 'Customer full name', example: 'John Doe' },
      { name: 'orderNumber', description: 'Order ID', example: 'ORD-2025-001' },
      { name: 'deliveryDate', description: 'Expected delivery date', example: 'Today, 3-5pm' }
    ],
    isActive: true,
    isDefault: true
  },
  {
    templateType: 'order_shipped_pickup',
    name: 'Order Ready for Pickup',
    subject: 'Your Order is Ready for Pickup #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlowNatura</h1>
    </div>
    <div class="content">
      <h2>Your Order is Ready for Pickup!</h2>
      <p>Hi {{customerName}},</p>
      <p>Your order #{{orderNumber}} is ready for pickup.</p>
      <p><strong>Pickup Location:</strong> {{pickupAddress}}</p>
      <p>Please bring a valid ID when collecting your order.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 GlowNatura. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: 'Hi {{customerName}}, your order #{{orderNumber}} is ready for pickup at {{pickupAddress}}',
    variables: [
      { name: 'customerName', description: 'Customer full name', example: 'John Doe' },
      { name: 'orderNumber', description: 'Order ID', example: 'ORD-2025-001' },
      { name: 'pickupAddress', description: 'Pickup location address', example: '123 Main St, Lagos' }
    ],
    isActive: true,
    isDefault: true
  },
  {
    templateType: 'order_delivered',
    name: 'Order Delivered',
    subject: 'Your Order Has Been Delivered #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlowNatura</h1>
    </div>
    <div class="content">
      <h2>Your Order Has Been Delivered!</h2>
      <p>Hi {{customerName}},</p>
      <p>Your order #{{orderNumber}} has been delivered.</p>
      <p>We hope you love your GlowNatura products!</p>
      <p>Please leave us a review to let us know how we did.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 GlowNatura. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: 'Hi {{customerName}}, your order #{{orderNumber}} has been delivered. Thank you for shopping with us!',
    variables: [
      { name: 'customerName', description: 'Customer full name', example: 'John Doe' },
      { name: 'orderNumber', description: 'Order ID', example: 'ORD-2025-001' }
    ],
    isActive: true,
    isDefault: true
  },
  {
    templateType: 'order_cancelled',
    name: 'Order Cancellation Confirmation',
    subject: 'Order Cancellation Confirmation #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlowNatura</h1>
    </div>
    <div class="content">
      <h2>Order Cancelled</h2>
      <p>Hi {{customerName}},</p>
      <p>Your order #{{orderNumber}} has been cancelled.</p>
      <p><strong>Reason:</strong> {{cancellationReason}}</p>
      <p>If you paid for this order, a refund will be processed within 5-7 business days.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 GlowNatura. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: 'Hi {{customerName}}, your order #{{orderNumber}} has been cancelled. Reason: {{cancellationReason}}',
    variables: [
      { name: 'customerName', description: 'Customer full name', example: 'John Doe' },
      { name: 'orderNumber', description: 'Order ID', example: 'ORD-2025-001' },
      { name: 'cancellationReason', description: 'Reason for cancellation', example: 'Customer request' }
    ],
    isActive: true,
    isDefault: true
  }
];

async function seedEmailTemplates() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    
    if (!MONGO_URI) {
      console.error('❌ Error: MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    // Clear existing templates
    const deletedCount = await EmailTemplate.deleteMany({});
    logger.info(`Deleted ${deletedCount.deletedCount} existing templates`);

    // Insert default templates
    const inserted = await EmailTemplate.insertMany(defaultTemplates);
    logger.info(`✅ Successfully seeded ${inserted.length} email templates`);

    // Log template types
    console.log('\n📧 Email Templates Created:');
    inserted.forEach(template => {
      console.log(`   - ${template.name} (${template.templateType})`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding email templates:', error);
    process.exit(1);
  }
}

// Run the seeder
seedEmailTemplates();

