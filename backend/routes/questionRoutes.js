// ===================================
// ROUTES/QUESTIONROUTES.JS - Questions Routes
// ===================================

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', questionController.getAllQuestions);
router.get('/stats', authMiddleware, questionController.getDashboardStats);
router.get('/analytics', authMiddleware, questionController.getAnalytics);
router.get('/:id', questionController.getQuestionById);

// Protected routes (require authentication)
router.post('/', authMiddleware, questionController.createQuestion);
router.put('/:id', authMiddleware, questionController.updateQuestion);
router.delete('/:id', authMiddleware, questionController.deleteQuestion);
router.post('/merge', authMiddleware, questionController.mergeQuestions);

module.exports = router;
