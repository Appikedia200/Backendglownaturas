/**
 * Manage Email Templates Use Case
 * Handles email template business logic
 * @version 5.1.0
 */

const { ValidationError, ConflictError } = require('../../../shared/errors/AppError');
const logger = require('../../../config/logger');

class ManageEmailTemplatesUseCase {
  /**
   * @param {IEmailTemplateRepository} emailTemplateRepository
   */
  constructor(emailTemplateRepository) {
    this.emailTemplateRepository = emailTemplateRepository;
  }

  /**
   * Get all templates
   */
  async getAllTemplates() {
    return await this.emailTemplateRepository.findAll();
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    return await this.emailTemplateRepository.findById(id);
  }

  /**
   * Get template by name
   */
  async getTemplateByName(name) {
    return await this.emailTemplateRepository.findByName(name);
  }

  /**
   * Get template by templateType
   */
  async getTemplateByType(templateType) {
    return await this.emailTemplateRepository.findByType(templateType);
  }

  /**
   * Create template
   */
  async createTemplate(dto) {
    // Check if template with same name exists
    const existing = await this.emailTemplateRepository.findByName(dto.name);
    
    if (existing) {
      throw new ConflictError('Template with this name already exists');
    }

    const template = await this.emailTemplateRepository.create(dto);
    
    logger.info('Email template created', { 
      templateId: template._id,
      name: template.name 
    });

    return template;
  }

  /**
   * Update template
   */
  async updateTemplate(id, updates) {
    const template = await this.emailTemplateRepository.update(id, updates);
    
    logger.info('Email template updated', { templateId: id });

    return template;
  }

    /**
   * Update template by templateType
   */
    async updateTemplateByType(templateType, updates) {
      const template = await this.emailTemplateRepository.updateByType(templateType, updates);
  
      logger.info('Email template updated', { templateType });
  
      return template;
    }
  

  /**
   * Delete template
   */
  async deleteTemplate(id) {
    await this.emailTemplateRepository.delete(id);
    
    logger.info('Email template deleted', { templateId: id });

    return { message: 'Email template deleted successfully' };
  }

  /**
   * Preview template with sample data
   */
  async previewTemplate(templateType, sampleData) {
    const template = await this.emailTemplateRepository.findByType(templateType);
    
    // Replace variables in the HTML content with sample data
    let previewHtml = template.htmlContent;
    let previewSubject = template.subject;
    
    // Create mapping for both {VARIABLE} and {{variable}} formats
    const variableMappings = {
      // Customer
      'CUSTOMER_NAME': sampleData.customerName || 'John Doe',
      'CUSTOMER_EMAIL': sampleData.customerEmail || 'customer@example.com',
      'CUSTOMER_PHONE': sampleData.customerPhone || '+234 801 234 5678',
      
      // Order
      'ORDER_ID': sampleData.orderNumber || sampleData.orderId || 'ORD-2025-001',
      'ORDER_DATE': sampleData.orderDate || new Date().toLocaleDateString(),
      'ORDER_TOTAL': sampleData.total || '₦12,000',
      'SUBTOTAL': sampleData.subtotal || '₦10,000',
      'SHIPPING_FEE': sampleData.shipping || sampleData.shippingFee || '₦2,000',
      'TAX': sampleData.tax || '₦0',
      
      // Payment
      'PAYMENT_METHOD': sampleData.paymentMethod || 'Bank Transfer',
      'TRANSACTION_REF': sampleData.transactionRef || 'TXN-123456',
      
      // Shipping
      'TRACKING_NUMBER': sampleData.trackingNumber || 'TRACK123456',
      'TRACKING_URL': sampleData.trackingUrl || 'https://tracking.example.com/TRACK123456',
      'ESTIMATED_DELIVERY': sampleData.estimatedDelivery || '3-5 business days',
      'DELIVERY_ADDRESS': sampleData.deliveryAddress || '123 Main St, Lagos, Nigeria',
      
      // Cancel/Refund
      'CANCEL_REASON': sampleData.reason || sampleData.cancelReason || 'Customer requested cancellation',
      'REFUND_AMOUNT': sampleData.refundAmount || '₦12,000',
      
      // Store
      'STORE_NAME': 'GLOWNATURA',
      'STORE_EMAIL': 'support@glownaturas.com',
      'STORE_PHONE': '+234 801 234 5678',
      'STORE_URL': 'https://glownaturas.com'
    };
    
    // Replace {VARIABLE} format (backend format)
    Object.keys(variableMappings).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      previewHtml = previewHtml.replace(regex, variableMappings[key]);
      previewSubject = previewSubject.replace(regex, variableMappings[key]);
    });
    
    logger.info('Email template preview generated', { templateType });
    
    return { html: previewHtml, subject: previewSubject };
  }

  /**
   * Send test email
   */
  async sendTestEmail(templateType, testEmail, sampleData, emailService) {
    const template = await this.emailTemplateRepository.findByType(templateType);
    
    // Replace variables in the HTML content with sample data
    let emailHtml = template.htmlContent;
    let emailSubject = template.subject;
    
    // Create mapping for both {VARIABLE} and {{variable}} formats
    const variableMappings = {
      // Customer
      'CUSTOMER_NAME': sampleData.customerName || 'John Doe',
      'CUSTOMER_EMAIL': sampleData.customerEmail || 'customer@example.com',
      'CUSTOMER_PHONE': sampleData.customerPhone || '+234 801 234 5678',
      
      // Order
      'ORDER_ID': sampleData.orderNumber || sampleData.orderId || 'ORD-2025-001',
      'ORDER_DATE': sampleData.orderDate || new Date().toLocaleDateString(),
      'ORDER_TOTAL': sampleData.total || '₦12,000',
      'SUBTOTAL': sampleData.subtotal || '₦10,000',
      'SHIPPING_FEE': sampleData.shipping || sampleData.shippingFee || '₦2,000',
      'TAX': sampleData.tax || '₦0',
      
      // Payment
      'PAYMENT_METHOD': sampleData.paymentMethod || 'Bank Transfer',
      'TRANSACTION_REF': sampleData.transactionRef || 'TXN-123456',
      
      // Shipping
      'TRACKING_NUMBER': sampleData.trackingNumber || 'TRACK123456',
      'TRACKING_URL': sampleData.trackingUrl || 'https://tracking.example.com/TRACK123456',
      'ESTIMATED_DELIVERY': sampleData.estimatedDelivery || '3-5 business days',
      'DELIVERY_ADDRESS': sampleData.deliveryAddress || '123 Main St, Lagos, Nigeria',
      
      // Cancel/Refund
      'CANCEL_REASON': sampleData.reason || sampleData.cancelReason || 'Customer requested cancellation',
      'REFUND_AMOUNT': sampleData.refundAmount || '₦12,000',
      
      // Store
      'STORE_NAME': 'GLOWNATURA',
      'STORE_EMAIL': 'support@glownaturas.com',
      'STORE_PHONE': '+234 801 234 5678',
      'STORE_URL': 'https://glownaturas.com'
    };
    
    // Replace {VARIABLE} format (backend format)
    Object.keys(variableMappings).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      emailHtml = emailHtml.replace(regex, variableMappings[key]);
      emailSubject = emailSubject.replace(regex, variableMappings[key]);
    });
    
    // Send via email service
    await emailService.send(testEmail, `[TEST] ${emailSubject}`, emailHtml);
    
    logger.info('Test email sent', { templateType, to: testEmail });
    
    return { message: `Test email sent successfully to ${testEmail}` };
  }

  /**
   * Restore template to default
   */
  async restoreToDefault(templateType, defaultTemplates) {
    const defaultTemplate = defaultTemplates.find(t => t.templateType === templateType);
    
    if (!defaultTemplate) {
      throw new ValidationError(`No default template found for type: ${templateType}`);
    }
    
    // Update with default content
    const template = await this.emailTemplateRepository.updateByType(templateType, {
      subject: defaultTemplate.subject,
      htmlContent: defaultTemplate.htmlContent,
      textContent: defaultTemplate.textContent,
      isDefault: true
    });
    
    logger.info('Email template restored to default', { templateType });
    
    return template;
  }
}

module.exports = ManageEmailTemplatesUseCase;

