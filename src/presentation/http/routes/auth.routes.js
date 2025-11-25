/**
 * Auth Routes - Clean Architecture
 * @version 5.1.0
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

// LAZY LOADING: Get controller only when route is called
router.post('/login', (req, res, next) => container.getAuthController().login(req, res, next));
router.post('/register', (req, res, next) => container.getAuthController().register(req, res, next));

// Verification routes - both POST (code) and GET (token link)
router.post('/verify-email', (req, res, next) => container.getAuthController().verifyEmail(req, res, next));
router.get('/verify-email', (req, res, next) => container.getAuthController().verifyEmailWithToken(req, res, next));

router.post('/resend-verification', (req, res, next) => container.getAuthController().resendVerification(req, res, next));
router.post('/forgot-password', (req, res, next) => container.getAuthController().forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => container.getAuthController().resetPassword(req, res, next));
router.post('/logout', protect, (req, res, next) => container.getAuthController().logout(req, res, next));
router.post('/change-password', protect, (req, res, next) => container.getAuthController().changePassword(req, res, next));
router.get('/me', protect, (req, res, next) => container.getAuthController().getMe(req, res, next));

module.exports = router;

