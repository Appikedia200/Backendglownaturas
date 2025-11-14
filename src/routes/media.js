const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const { logAdminAction } = require('../middleware/auditLog');
const upload = require('../middleware/upload');

router.use(protect);

router.post(
  '/',
  upload.array('files', 10),
  logAdminAction('create', 'media'),
  mediaController.uploadMedia
);

router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMedia);

router.put(
  '/:id',
  logAdminAction('update', 'media'),
  mediaController.updateMedia
);

router.delete(
  '/:id',
  logAdminAction('delete', 'media'),
  mediaController.deleteMedia
);

router.delete(
  '/bulk/unused',
  logAdminAction('delete', 'media'),
  mediaController.bulkDeleteUnused
);

module.exports = router;
