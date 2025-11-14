const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validateRegistration, handleValidationErrors, authController.register);
router.post('/verify-email', authLimiter, authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

router.get('/me', protect, authController.getMe);
router.put('/update-password', protect, authController.updatePassword);

router.get('/admins', protect, restrictTo('superadmin'), authController.getAllAdmins);
router.put('/admins/:id/activate', protect, restrictTo('superadmin'), authController.toggleAdminStatus);

module.exports = router;

