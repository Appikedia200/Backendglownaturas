const transporter = require('../config/email');

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error(`Email send failed to ${options.to}:`, error.message);
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

