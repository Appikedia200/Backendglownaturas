/**
 * Email Templates Routes - Clean Architecture
 * @version 5.1.0
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

// All routes require authentication
router.use(protect);

// LAZY LOADING: Get controller only when route is called
// Email template actions (specific routes MUST come before /:id to avoid route conflicts)
router.post('/preview', (req, res, next) => container.getEmailTemplateController().preview(req, res, next));
router.post('/test-send', (req, res, next) => container.getEmailTemplateController().testSend(req, res, next));
router.post('/:type/restore', (req, res, next) => container.getEmailTemplateController().restore(req, res, next));

// Generic CRUD routes
router.get('/', (req, res, next) => container.getEmailTemplateController().getAll(req, res, next));
router.get('/:id', (req, res, next) => container.getEmailTemplateController().getOne(req, res, next));
router.post('/', (req, res, next) => container.getEmailTemplateController().create(req, res, next));
router.put('/:id', (req, res, next) => container.getEmailTemplateController().update(req, res, next));
router.delete('/:id', (req, res, next) => container.getEmailTemplateController().delete(req, res, next));

module.exports = router;

