// src/routes/auth.js
const express = require('express');
const authController = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
