const EmailTemplate = require('../infrastructure/database/mongodb/models/EmailTemplate');
const { sendEmail } = require('../utils/emailService');
const logger = require('../config/logger');

exports.getAllTemplates = async (req, res, next) => {
  try {
    const templates = await EmailTemplate.find()
      .sort({ templateType: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    logger.error(`Get templates failed: ${error.message}`);
    next(error);
  }
};

exports.getTemplateByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    const template = await EmailTemplate.findOne({ templateType: type });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error(`Get template failed: ${error.message}`);
    next(error);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { subject, htmlContent, textContent } = req.body;
    
    const template = await EmailTemplate.findOne({ templateType: type });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    if (subject) template.subject = subject;
    if (htmlContent) template.htmlContent = htmlContent;
    if (textContent) template.textContent = textContent;
    template.lastModifiedBy = req.admin._id;
    
    await template.save();
    
    logger.info(`Template ${type} updated by ${req.admin.name}`);
    
    res.json({
      success: true,
      data: template,
      message: 'Template updated successfully'
    });
  } catch (error) {
    logger.error(`Update template failed: ${error.message}`);
    next(error);
  }
};

exports.previewTemplate = async (req, res, next) => {
  try {
    const { type, sampleData } = req.body;
    
    const template = await EmailTemplate.findOne({ templateType: type });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    let previewHtml = template.htmlContent;
    let previewSubject = template.subject;
    
    template.variables.forEach(variable => {
      const value = sampleData[variable.name] || variable.example;
      const regex = new RegExp(`{${variable.name}}`, 'g');
      previewHtml = previewHtml.replace(regex, value);
      previewSubject = previewSubject.replace(regex, value);
    });
    
    res.json({
      success: true,
      data: {
        subject: previewSubject,
        html: previewHtml
      }
    });
  } catch (error) {
    logger.error(`Preview template failed: ${error.message}`);
    next(error);
  }
};

exports.sendTestEmail = async (req, res, next) => {
  try {
    const { type, testEmail, sampleData } = req.body;
    
    const template = await EmailTemplate.findOne({ templateType: type });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    let emailHtml = template.htmlContent;
    let emailSubject = template.subject;
    
    template.variables.forEach(variable => {
      const value = sampleData[variable.name] || variable.example;
      const regex = new RegExp(`{${variable.name}}`, 'g');
      emailHtml = emailHtml.replace(regex, value);
      emailSubject = emailSubject.replace(regex, value);
    });
    
    await sendEmail({
      to: testEmail,
      subject: `[TEST] ${emailSubject}`,
      html: emailHtml
    });
    
    logger.info(`Test email sent to ${testEmail} for template ${type}`);
    
    res.json({
      success: true,
      message: `Test email sent to ${testEmail}`
    });
  } catch (error) {
    logger.error(`Send test email failed: ${error.message}`);
    next(error);
  }
};

exports.restoreDefault = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    const defaultTemplates = require('../utils/defaultEmailTemplates');
    const defaultTemplate = defaultTemplates[type];
    
    if (!defaultTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Default template not found'
      });
    }
    
    const template = await EmailTemplate.findOne({ templateType: type });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    template.subject = defaultTemplate.subject;
    template.htmlContent = defaultTemplate.htmlContent;
    template.textContent = defaultTemplate.textContent;
    template.lastModifiedBy = req.admin._id;
    
    await template.save();
    
    logger.info(`Template ${type} restored to default by ${req.admin.name}`);
    
    res.json({
      success: true,
      data: template,
      message: 'Template restored to default'
    });
  } catch (error) {
    logger.error(`Restore default failed: ${error.message}`);
    next(error);
  }
};


