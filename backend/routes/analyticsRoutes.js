// ===================================
// ROUTES/ANALYTICSROUTES.JS - Analytics Routes
// ===================================

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

// Analytics endpoints
router.get('/', authMiddleware, analyticsController.getAnalytics);

module.exports = router;
