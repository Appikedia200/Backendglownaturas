const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.get('/', settingsController.getSettings);
router.put('/', protect, settingsController.updateSettings);
router.put('/store-info', protect, settingsController.updateStoreInfo);
router.put('/whatsapp', protect, settingsController.updateWhatsappSettings);
router.put('/email-templates', protect, settingsController.updateEmailTemplates);
router.put('/social-media', protect, settingsController.updateSocialMedia);

module.exports = router;

