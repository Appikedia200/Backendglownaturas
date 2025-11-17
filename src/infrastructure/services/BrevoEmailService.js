const IEmailService = require('../../domain/services/IEmailService');
const brevo = require('@getbrevo/brevo');
const Config = require('../config');
const logger = require('../../config/logger');

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

  async send(to, subject, html) {
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
      
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: response.messageId
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
    const subject = `Order Confirmation - ${order.orderId}`;
    const html = this.buildOrderConfirmationTemplate(order);
    await this.send(order.customer.email, subject, html);
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

  async sendVerificationCode(email, name, code) {
    const subject = 'Verify Your Email - GlowNatura Admin';
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
          <h2>Welcome to GlowNatura Admin!</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          <p><strong>Expires in 24 hours.</strong></p>
        </div>
      </body>
      </html>
    `;
    
    await this.send(email, subject, html);
  }

  async sendPasswordReset(email, name, code) {
    const subject = 'Password Reset Code - GlowNatura Admin';
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
          <p>Hi ${name},</p>
          <p>Your password reset code is:</p>
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          <p><strong>Expires in 1 hour.</strong></p>
        </div>
      </body>
      </html>
    `;
    
    await this.send(email, subject, html);
  }

  buildOrderConfirmationTemplate(order) {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">${item.productName}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">₦${item.subtotal.toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #f9fafb; padding: 12px; text-align: left; border: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Order Confirmation</h1>
          <p>Hi ${order.customer.name},</p>
          <p>Thank you for your order! Order ID: <strong>${order.orderId}</strong></p>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p><strong>Subtotal:</strong> ₦${order.subtotal.toLocaleString()}</p>
          <p><strong>Shipping:</strong> ₦${order.shippingFee.toLocaleString()}</p>
          <p><strong>Total:</strong> ₦${order.total.toLocaleString()}</p>
          
          <p>Need help? Contact us on WhatsApp: ${Config.store.whatsappNumber}</p>
        </div>
      </body>
      </html>
    `;
  }

  buildOrderStatusTemplate(order, status) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Order Status Update</h1>
          <p>Hi ${order.customer.name},</p>
          <p>Your order <strong>${order.orderId}</strong> status has been updated to: <strong>${status}</strong></p>
          <p>Thank you for shopping with GlowNatura!</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = BrevoEmailService;

