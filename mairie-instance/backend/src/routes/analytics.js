// src/routes/analytics.js
const express = require('express');
const analyticsController = require('../controllers/analytics');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Statistiques audiences
router.get('/audiences', analyticsController.getAudienceStats);
router.get('/audiences/trends', analyticsController.getAudienceTrends);

// Statistiques site
router.get('/site', analyticsController.getSiteStats);

// Dashboard
router.get('/dashboard', analyticsController.getDashboard);

// Tracking page views
router.post('/track', analyticsController.trackPageView);

module.exports = router;
