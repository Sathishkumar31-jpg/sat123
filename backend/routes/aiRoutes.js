// ===================================
// ROUTES/AIROUTES.JS - AI Routes
// ===================================

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

// AI analysis endpoints
router.post('/analyze', aiController.analyzeQuestion);
router.post('/similarity', aiController.findSimilarQuestions);
router.post('/difficulty', aiController.predictDifficulty);
router.post('/subject', aiController.predictSubject);
router.post('/bloom', aiController.predictBloom);
router.post('/autotag', aiController.autoTag);
router.post('/duplicates', optionalAuth, aiController.findDuplicates);

module.exports = router;
