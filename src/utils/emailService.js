const transporter = require('../config/email');
const EmailTemplate = require('../models/EmailTemplate');
const Settings = require('../models/Settings');
const logger = require('../config/logger');
const path = require('path');

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`, {
      messageId: info.messageId,
      subject: options.subject
    });
    return info;
  } catch (error) {
    logger.error(`Email send failed to ${options.to}: ${error.message}`, {
      subject: options.subject,
      error: error.stack
    });
    throw error;
  }
};

exports.sendVerificationEmail = async (admin, verificationCode) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code-box { 
          background: #f4f4f4; 
          border: 2px dashed #059669; 
          padding: 20px; 
          text-align: center; 
          margin: 20px 0;
          border-radius: 8px;
        }
        .code { 
          font-size: 32px; 
          font-weight: bold; 
          color: #059669; 
          letter-spacing: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to GlowNaturas Admin!</h2>
        <p>Hi ${admin.name},</p>
        <p>Your verification code is:</p>
        <div class="code-box">
          <div class="code">${verificationCode}</div>
        </div>
        <p><strong>Expires in 24 hours.</strong></p>
      </div>
    </body>
    </html>
  `;
  
  await this.sendEmail({
    to: admin.email,
    subject: 'Verify Your Email - GlowNaturas Admin',
    html
  });
};

exports.sendPasswordResetEmail = async (admin, resetCode) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code-box { 
          background: #f4f4f4; 
          border: 2px dashed #dc2626; 
          padding: 20px; 
          text-align: center; 
          margin: 20px 0;
          border-radius: 8px;
        }
        .code { 
          font-size: 32px; 
          font-weight: bold; 
          color: #dc2626; 
          letter-spacing: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hi ${admin.name},</p>
        <p>Your password reset code is:</p>
        <div class="code-box">
          <div class="code">${resetCode}</div>
        </div>
        <p><strong>Expires in 1 hour.</strong></p>
      </div>
    </body>
    </html>
  `;
  
  await this.sendEmail({
    to: admin.email,
    subject: 'Password Reset Code - GlowNaturas Admin',
    html
  });
};

exports.sendOrderConfirmationEmail = async (order, settings) => {
  const template = settings.emailTemplates.orderConfirmation;
  const subject = template.subject.replace('{{orderId}}', order.orderId);
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>&#8358;${item.price.toLocaleString()}</td>
      <td>&#8358;${item.subtotal.toLocaleString()}</td>
    </tr>
  `).join('');
  
  const html = `
    <h1>Order Confirmation</h1>
    <p>Hi ${order.customer.name},</p>
    <p>Thank you for your order! Order ID: <strong>${order.orderId}</strong></p>
    <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <p><strong>Subtotal:</strong> &#8358;${order.subtotal.toLocaleString()}</p>
    <p><strong>Shipping:</strong> &#8358;${order.shippingFee.toLocaleString()}</p>
    <p><strong>Total:</strong> &#8358;${order.total.toLocaleString()}</p>
    <p>Need help? <a href="https://wa.me/${settings.whatsapp.number}">Contact us on WhatsApp</a></p>
  `;
  
  await this.sendEmail({
    to: order.customer.email,
    subject,
    html
  });
};

exports.sendOrderStatusEmail = async (order, status, settings) => {
  const templates = {
    processing: settings.emailTemplates.orderProcessing,
    shipped: settings.emailTemplates.orderShipped,
    delivered: settings.emailTemplates.orderDelivered
  };
  
  const template = templates[status];
  if (!template) return;
  
  const subject = template.subject.replace('{{orderId}}', order.orderId);
  const html = template.body
    .replace('{{orderId}}', order.orderId)
    .replace('{{customerName}}', order.customer.name)
    .replace('{{trackingNumber}}', order.trackingNumber || 'N/A');
  
  await this.sendEmail({
    to: order.customer.email,
    subject,
    html
  });
};

exports.sendOrderEmail = async (order, templateType, pdfPath = null) => {
  try {
    // Get template from database
    const template = await EmailTemplate.findOne({ templateType });
    
    if (!template || !template.isActive) {
      logger.warn(`Template ${templateType} not found or inactive`);
      return;
    }
    
    // Get settings for bank details, WhatsApp, etc.
    const settings = await Settings.findOne();
    
    // Build items table for HTML
    const itemsTableHtml = `
      <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="border: 1px solid #e5e7eb; text-align: left; padding: 12px; color: #6b7280; font-size: 14px;">Product</th>
            <th style="border: 1px solid #e5e7eb; text-align: center; padding: 12px; color: #6b7280; font-size: 14px;">Qty</th>
            <th style="border: 1px solid #e5e7eb; text-align: right; padding: 12px; color: #6b7280; font-size: 14px;">Price</th>
            <th style="border: 1px solid #e5e7eb; text-align: right; padding: 12px; color: #6b7280; font-size: 14px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 12px; color: #1f2937; font-size: 14px;">${item.productName}</td>
              <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: center; color: #1f2937; font-size: 14px;">${item.quantity}</td>
              <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #1f2937; font-size: 14px;">₦${item.price.toLocaleString()}</td>
              <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #1f2937; font-size: 14px; font-weight: 600;">₦${item.subtotal.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    // Build items list for plain text
    const itemsText = order.items.map(item => 
      `• ${item.productName} x ${item.quantity} - ₦${item.subtotal.toLocaleString()}`
    ).join('\n');
    
    // Build variable replacements
    const variables = {
      CUSTOMER_NAME: order.customer.name,
      ORDER_ID: order.orderId,
      ORDER_DATE: order.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      TOTAL: `₦${order.total.toLocaleString()}`,
      SUBTOTAL: `₦${order.subtotal.toLocaleString()}`,
      SHIPPING: `₦${order.shippingFee.toLocaleString()}`,
      ITEMS_TABLE: itemsTableHtml,
      ITEMS_TEXT: itemsText,
      BANK_NAME: process.env.BANK_NAME || 'First Bank Nigeria',
      ACCOUNT_NUMBER: process.env.ACCOUNT_NUMBER || '1234567890',
      SHIPPING_ADDRESS: order.customer.address,
      CITY: order.customer.city,
      STATE: order.customer.state,
      WHATSAPP_NUMBER: settings?.whatsapp?.number || process.env.WHATSAPP_NUMBER || '+2348012345678',
      STORE_EMAIL: settings?.storeInfo?.email || process.env.STORE_EMAIL || 'orders@glownatura.com',
      STORE_URL: process.env.FRONTEND_URL || 'https://glownatura.com',
      CARRIER: order.shipping?.carrier || 'N/A',
      TRACKING_NUMBER: order.shipping?.trackingNumber || 'N/A',
      TRACKING_URL: order.shipping?.trackingUrl || '#',
      ESTIMATED_DELIVERY: order.shipping?.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD',
      DELIVERY_CONTACT: order.shipping?.riderContact || 'N/A',
      CUSTOM_MESSAGE: order.shipping?.customMessage || 'Our delivery agent will contact you before arrival.',
      PICKUP_ADDRESS: settings?.storeInfo?.address || '45 Allen Avenue, Ikeja, Lagos',
      PICKUP_CONTACT: settings?.whatsapp?.number || process.env.WHATSAPP_NUMBER || '+2348012345678',
      PICKUP_DEADLINE: order.shipping?.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Within 7 days',
      DELIVERY_DATE: order.shipping?.deliveredAt ? new Date(order.shipping.deliveredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      CANCEL_DATE: order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      CANCEL_REASON: order.cancelReason || 'Order cancelled',
      REFUND_MESSAGE: order.paymentStatus === 'paid' ? 'If payment was made, your refund will be processed within 5-7 business days.' : 'No payment was received, so no refund is necessary.'
    };
    
    // Replace variables in HTML content
    let emailHtml = template.htmlContent;
    let emailSubject = template.subject;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      emailHtml = emailHtml.replace(regex, variables[key]);
      emailSubject = emailSubject.replace(regex, variables[key]);
    });
    
    // Prepare mail options
    const mailOptions = {
      to: order.customer.email,
      subject: emailSubject,
      html: emailHtml
    };
    
    // Attach PDF if provided
    if (pdfPath) {
      mailOptions.attachments = [{
        filename: `Receipt-${order.orderId}.pdf`,
        path: pdfPath
      }];
    }
    
    // Send email
    await this.sendEmail(mailOptions);
    
    logger.info(`Order email sent: ${templateType} to ${order.customer.email}`, {
      orderId: order._id,
      templateType
    });
  } catch (error) {
    logger.error(`Failed to send order email: ${error.message}`, {
      orderId: order._id,
      templateType,
      error: error.stack
    });
    // Don't throw error - email failure shouldn't block order processing
  }
};

