const brevo = require('@getbrevo/brevo');
const logger = require('./logger');

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Wrapper to maintain compatibility with existing code
const brevoTransporter = {
  sendMail: async (mailOptions) => {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      // Map nodemailer options to Brevo format
      sendSmtpEmail.sender = {
        name: mailOptions.from?.split('<')[0]?.trim() || process.env.FROM_NAME || 'GlowNaturas',
        email: mailOptions.from?.match(/<(.+)>/)?.[1] || process.env.FROM_EMAIL || 'hello@glownatura.com'
      };

      sendSmtpEmail.to = [
        {
          email: typeof mailOptions.to === 'string' ? mailOptions.to : mailOptions.to.email,
          name: typeof mailOptions.to === 'object' ? mailOptions.to.name : undefined
        }
      ];

      sendSmtpEmail.subject = mailOptions.subject;
      sendSmtpEmail.htmlContent = mailOptions.html;

      // Handle attachments if present
      if (mailOptions.attachments && mailOptions.attachments.length > 0) {
        sendSmtpEmail.attachment = await Promise.all(
          mailOptions.attachments.map(async (att) => {
            const fs = require('fs').promises;
            const content = await fs.readFile(att.path);
            return {
              name: att.filename,
              content: content.toString('base64')
            };
          })
        );
      }

      // Send email via Brevo API
      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

      // Return nodemailer-like response
      return {
        messageId: response.messageId,
        accepted: [mailOptions.to],
        response: 'Email sent successfully via Brevo API'
      };
    } catch (error) {
      logger.error('Brevo API error', {
        message: error.message,
        response: error.response?.text,
        statusCode: error.response?.statusCode
      });
      throw new Error(`Email send failed: ${error.message}`);
    }
  }
};

module.exports = brevoTransporter;

