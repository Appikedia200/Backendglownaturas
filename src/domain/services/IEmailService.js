/**
 * Email Service Interface (Port)
 * Defines contract for email operations
 * @interface
 * @version 5.1.0
 */
class IEmailService {
  /**
   * Send generic email
   * @param {string} to
   * @param {string} subject
   * @param {string} html
   * @returns {Promise<void>}
   */
  async send(to, subject, html) {
    throw new Error('Method not implemented: send');
  }

  /**
   * Send order confirmation email
   * @param {Order} order
   * @returns {Promise<void>}
   */
  async sendOrderConfirmation(order) {
    throw new Error('Method not implemented: sendOrderConfirmation');
  }

  /**
   * Send order status update email
   * @param {Order} order
   * @param {string} status
   * @returns {Promise<void>}
   */
  async sendOrderStatusUpdate(order, status) {
    throw new Error('Method not implemented: sendOrderStatusUpdate');
  }

  /**
   * Send verification code email
   * @param {string} email
   * @param {string} name
   * @param {string} code
   * @returns {Promise<void>}
   */
  async sendVerificationCode(email, name, code) {
    throw new Error('Method not implemented: sendVerificationCode');
  }

  /**
   * Send password reset email
   * @param {string} email
   * @param {string} name
   * @param {string} code
   * @returns {Promise<void>}
   */
  async sendPasswordReset(email, name, code) {
    throw new Error('Method not implemented: sendPasswordReset');
  }
}

module.exports = IEmailService;

