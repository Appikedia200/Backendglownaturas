const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');

router.post('/register', validateRegistration, handleValidationErrors, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', protect, authController.getMe);
router.put('/update-password', protect, authController.updatePassword);

router.get('/admins', protect, restrictTo('superadmin'), authController.getAllAdmins);
router.put('/admins/:id/activate', protect, restrictTo('superadmin'), authController.toggleAdminStatus);

module.exports = router;

