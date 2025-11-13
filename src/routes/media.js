const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('file'), mediaController.uploadMedia);
router.get('/', protect, mediaController.getAllMedia);
router.get('/:id', protect, mediaController.getMedia);
router.put('/:id', protect, mediaController.updateMedia);
router.delete('/:id', protect, mediaController.deleteMedia);

router.post('/bulk-delete', protect, mediaController.bulkDeleteMedia);

module.exports = router;

