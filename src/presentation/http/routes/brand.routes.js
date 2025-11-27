/**
 * Brand Routes
 * Defines API endpoints for brand management
 * @version 5.2.1
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

// PUBLIC ROUTES - Available to all users
router.get('/', (req, res, next) => 
  container.getBrandController().getAllBrands(req, res, next)
);

router.get('/letter/:letter', (req, res, next) => 
  container.getBrandController().getBrandsByLetter(req, res, next)
);

router.get('/:slug', (req, res, next) => 
  container.getBrandController().getBrandBySlug(req, res, next)
);

// ADMIN ROUTES - Require authentication
router.post('/', protect, (req, res, next) => 
  container.getBrandController().createBrand(req, res, next)
);

router.put('/:id', protect, (req, res, next) => 
  container.getBrandController().updateBrand(req, res, next)
);

router.delete('/:id', protect, (req, res, next) => 
  container.getBrandController().deleteBrand(req, res, next)
);

router.post('/sync', protect, (req, res, next) => 
  container.getBrandController().syncBrands(req, res, next)
);

module.exports = router;

