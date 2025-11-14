const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const { protect } = require('../middleware/auth');
const { logAdminAction } = require('../middleware/auditLog');

router.use(protect);

router.get('/', emailTemplateController.getAllTemplates);
router.get('/:type', emailTemplateController.getTemplateByType);

router.put(
  '/:type',
  logAdminAction('update', 'email_template'),
  emailTemplateController.updateTemplate
);

router.post('/preview', emailTemplateController.previewTemplate);
router.post('/test-send', emailTemplateController.sendTestEmail);

router.post(
  '/:type/restore',
  logAdminAction('update', 'email_template'),
  emailTemplateController.restoreDefault
);

module.exports = router;

