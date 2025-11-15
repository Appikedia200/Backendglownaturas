/**
 * Email Template Service
 * Centralized email template management for authentication system
 * Follows DRY principle - single source of truth for all email templates
 * 
 * @module services/emailTemplateService
 * @version 5.1.0
 */

/**
 * Generate verification email template
 * @param {string} adminName - Name of the admin
 * @param {string} verificationUrl - Verification URL with token
 * @returns {Object} Email template with subject and HTML
 */
exports.getVerificationEmailTemplate = (adminName, verificationUrl) => {
  const subject = 'Verify Your GlowNatura Admin Account';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
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
        .content h2 {
          color: #059669;
          margin-top: 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #059669;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #047857;
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
          <h2>Verify Your Email Address</h2>
          <p>Hi <strong>${adminName}</strong>,</p>
          <p>Thank you for registering as an admin for GlowNatura. To complete your registration and access the admin portal, please verify your email address.</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #059669; background-color: #f0fdf4; padding: 10px; border-radius: 4px;">
            ${verificationUrl}
          </p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 GlowNatura. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

/**
 * Generate password reset email template
 * @param {string} adminName - Name of the admin
 * @param {string} resetUrl - Password reset URL with token
 * @returns {Object} Email template with subject and HTML
 */
exports.getPasswordResetEmailTemplate = (adminName, resetUrl) => {
  const subject = 'Password Reset Request - GlowNatura Admin';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
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
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
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
        .content h2 {
          color: #dc2626;
          margin-top: 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #dc2626;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #991b1b;
        }
        .warning {
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin: 20px 0;
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
          <h2>Password Reset Request</h2>
          <p>Hi <strong>${adminName}</strong>,</p>
          <p>We received a request to reset your admin account password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #dc2626; background-color: #fef2f2; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          <div class="warning">
            <p style="margin: 0;"><strong>Important Security Information:</strong></p>
            <ul style="margin: 10px 0 0 0;">
              <li>This link will expire in <strong>1 hour</strong></li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will remain unchanged</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2025 GlowNatura. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

