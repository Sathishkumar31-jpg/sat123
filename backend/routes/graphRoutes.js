// ===================================
// ROUTES/GRAPHROUTES.JS - Graph Routes
// ===================================

const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');
const { authMiddleware } = require('../middleware/auth');

// Graph endpoints
router.get('/', graphController.getGraphData);
router.get('/node/:id', graphController.getNodeDetails);

module.exports = router;
