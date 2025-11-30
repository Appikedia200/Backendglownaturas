const IEmailService = require('../../domain/services/IEmailService');
const brevo = require('@getbrevo/brevo');
const Config = require('../config');
const logger = require('../../config/logger');
const fs = require('fs');
const { generatePDFReceipt } = require('../../utils/pdfGenerator');

/**
 * Brevo Email Service Implementation (Adapter)
 * Implements IEmailService using Brevo API
 * @version 5.1.0
 */
class BrevoEmailService extends IEmailService {
  constructor() {
    super();
    
    // Initialize Brevo API client
    this.apiInstance = new brevo.TransactionalEmailsApi();
    
    // Set API key
    const emailConfig = Config.email;
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      emailConfig.apiKey
    );
    
    this.from = emailConfig.from;
  }

  async send(to, subject, html, attachments = []) {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      
      sendSmtpEmail.sender = {
        name: this.from.name,
        email: this.from.email
      };
      
      sendSmtpEmail.to = [{
        email: to
      }];
      
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      
      // Add attachments if provided
      if (attachments && attachments.length > 0) {
        sendSmtpEmail.attachment = attachments;
      }
      
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: response.messageId,
        attachments: attachments.length
      });
    } catch (error) {
      logger.error('Email send failed', {
        to,
        subject,
        error: error.message
      });
      throw error;
    }
  }

  async sendOrderConfirmation(order) {
    try {
      const subject = `Order Confirmation - ${order.orderId}`;
      const html = this.buildOrderConfirmationTemplate(order);
      
      // Generate PDF invoice
      const pdfPath = await generatePDFReceipt(order);
      
      // Read PDF file and convert to base64
      const pdfContent = fs.readFileSync(pdfPath);
      const pdfBase64 = pdfContent.toString('base64');
      
      // Prepare attachment for Brevo
      const attachments = [{
        content: pdfBase64,
        name: `Invoice-${order.orderId}.pdf`
      }];
      
      // Send email with PDF attachment
      await this.send(order.customer.email, subject, html, attachments);
      
      // Clean up: delete PDF file after sending
      fs.unlinkSync(pdfPath);
      
      logger.info('Order confirmation email sent with PDF attachment', {
        orderId: order.orderId,
        email: order.customer.email
      });
    } catch (error) {
      logger.error('Failed to send order confirmation with PDF', {
        orderId: order.orderId,
        error: error.message
      });
      // Fallback: send email without PDF if something fails
      const subject = `Order Confirmation - ${order.orderId}`;
      const html = this.buildOrderConfirmationTemplate(order);
      await this.send(order.customer.email, subject, html);
    }
  }

  async sendOrderStatusUpdate(order, status) {
    const statusMessages = {
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    const subject = `Order ${order.orderId} - ${statusMessages[status]}`;
    const html = this.buildOrderStatusTemplate(order, status);
    await this.send(order.customer.email, subject, html);
  }

  async sendVerificationLink(email, name, verificationLink) {
    const subject = 'Verify Your Email - GlowNatura Admin';
    
    // Ensure name is properly passed and not undefined
    const adminName = name || 'Admin';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .verify-button { 
            display: inline-block;
            background: #059669;
            color: white !important;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .verify-button:hover {
            background: #047857;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GlowNatura Admin Portal</h1>
          </div>
          <div class="content">
            <h2 style="color: #059669; margin-top: 0;">Welcome, ${adminName}!</h2>
            <p>Thank you for registering as an admin for GlowNatura.</p>
            <p>Please verify your account by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
            </div>
            <p><strong>This link expires in 24 hours.</strong></p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationLink}" style="color: #059669; word-break: break-all;">${verificationLink}</a>
            </p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 GlowNatura. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    logger.info('Sending verification link email', { email, name: adminName });
    await this.send(email, subject, html);
  }

  async sendPasswordReset(email, name, code) {
    const subject = 'Password Reset Code - GlowNatura Admin';
    
    // Ensure variables are properly set
    const adminName = name || 'Admin';
    const resetCode = code || '';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .code-box { 
            background: #fef2f2; 
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
          .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2 style="color: #dc2626; margin-top: 0;">Hello, ${adminName}</h2>
            <p>We received a request to reset your password for your GlowNatura Admin account.</p>
            <p>Your password reset code is:</p>
            <div class="code-box">
              <div class="code">${resetCode}</div>
            </div>
            <p><strong>This code expires in 1 hour.</strong></p>
            <p>Please enter this code in the admin panel to reset your password.</p>
            <p style="margin-top: 30px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; color: #dc2626;">
              <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 GlowNatura. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    logger.info('Sending password reset email', { email, name: adminName });
    await this.send(email, subject, html);
  }

  buildOrderConfirmationTemplate(order) {
    // Ensure customer name is properly extracted
    const customerName = order.customer?.name || 'Valued Customer';
    const orderNumber = order.orderId || 'N/A';
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">${item.productName || 'Product'}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">₦${(item.price || 0).toLocaleString()}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">₦${(item.subtotal || 0).toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { 
            background-color: #f9fafb; 
            padding: 12px; 
            text-align: left; 
            border: 1px solid #e5e7eb;
            font-weight: bold;
          }
          .totals {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 8px;
          }
          .totals p {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
          }
          .totals .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            border-top: 2px solid #059669;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed</h1>
          </div>
          <div class="content">
            <h2 style="color: #059669; margin-top: 0;">Hi ${customerName},</h2>
            <p>Thank you for your order! We've received your order and will process it shortly.</p>
            <p><strong>Order ID:</strong> ${orderNumber}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="totals">
              <p><span>Subtotal:</span><span>₦${(order.subtotal || 0).toLocaleString()}</span></p>
              <p><span>Shipping Fee:</span><span>₦${(order.shippingFee || 0).toLocaleString()}</span></p>
              <p class="grand-total"><span>Total:</span><span>₦${(order.total || 0).toLocaleString()}</span></p>
            </div>
            
            <p style="margin-top: 30px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #059669; color: #047857;">
              <strong>Need Help?</strong><br>
              Contact us on WhatsApp or check your order status in your account.
            </p>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              <strong>Delivery Information:</strong><br>
              ${order.customer?.address || 'Address on file'}<br>
              ${order.customer?.city || ''}, ${order.customer?.state || ''}<br>
              Phone: ${order.customer?.phone || 'N/A'}
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 GlowNatura. All rights reserved.</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  buildOrderStatusTemplate(order, status) {
    // Ensure customer name is properly extracted
    const customerName = order.customer?.name || 'Valued Customer';
    const orderNumber = order.orderId || 'N/A';
    
    const statusColors = {
      pending: '#f59e0b',
      confirmed: '#059669',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    
    const statusColor = statusColors[status] || '#6b7280';
    
    const statusMessages = {
      confirmed: 'Your payment has been confirmed!',
      processing: 'Your order is being prepared.',
      shipped: 'Your order is on its way!',
      delivered: 'Your order has been delivered successfully!',
      cancelled: 'Your order has been cancelled.'
    };
    
    const statusMessage = statusMessages[status] || `Your order status has been updated.`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: ${statusColor};
            color: white;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 14px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <h2 style="color: ${statusColor}; margin-top: 0;">Hi ${customerName},</h2>
            <p>${statusMessage}</p>
            <p><strong>Order ID:</strong> ${orderNumber}</p>
            <p style="text-align: center; margin: 30px 0;">
              <span class="status-badge">${status}</span>
            </p>
            <p style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
              You can track your order status and view more details in your account.
            </p>
            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              If you have any questions, feel free to contact our customer support.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 GlowNatura. All rights reserved.</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = BrevoEmailService;

