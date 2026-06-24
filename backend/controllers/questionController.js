// ===================================
// CONTROLLERS/QUESTIONCONTROLLER.JS - Questions Controller
// ===================================

const Question = require('../models/Question');
const User = require('../models/User');

// ===================================
// GET ALL QUESTIONS
// ===================================

const getAllQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', subject = '', difficulty = '', status = '' } = req.query;

        const filter = { isActive: true };
        const queryLimit = parseInt(limit);
        const queryPage = parseInt(page);

        // Apply filters
        if (search) {
            filter.$text = { $search: search };
        }
        if (subject) {
            filter.subject = subject;
        }
        if (difficulty) {
            filter.difficulty = difficulty;
        }
        if (status) {
            filter.status = status;
        }

        // Pagination
        const skip = (queryPage - 1) * queryLimit;

        const questions = await Question.find(filter)
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(queryLimit)
            .sort({ createdAt: -1 });

        const total = await Question.countDocuments(filter);

        res.json({
            success: true,
            data: {
                questions,
                totalPages: Math.ceil(total / queryLimit),
                currentPage: queryPage,
                totalQuestions: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching questions',
            error: error.message
        });
    }
};

// ===================================
// GET SINGLE QUESTION
// ===================================

const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Increment views
        question.views = (question.views || 0) + 1;
        await question.save();

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching question',
            error: error.message
        });
    }
};

// ===================================
// CREATE QUESTION
// ===================================

const createQuestion = async (req, res) => {
    try {
        const { questionText, subject, difficulty, options, correctAnswer, status, tags, bloomLevel, explanation } = req.body;

        // Validation
        if (!questionText || !subject || !correctAnswer) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: questionText, subject, correctAnswer'
            });
        }

        const question = new Question({
            questionText,
            subject,
            difficulty: difficulty || 'Medium',
            bloomLevel: bloomLevel || 'Understand',
            options: options || [],
            correctAnswer,
            status: status || 'draft',
            tags: tags || [],
            explanation: explanation || '',
            createdBy: req.user.userId
        });

        await question.save();

        // Update user statistics
        await User.findByIdAndUpdate(
            req.user.userId,
            { $inc: { 'statistics.questionsCreated': 1 } }
        );

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating question',
            error: error.message
        });
    }
};

// ===================================
// UPDATE QUESTION
// ===================================

const updateQuestion = async (req, res) => {
    try {
        const { questionText, subject, difficulty, options, correctAnswer, status, tags, bloomLevel, explanation } = req.body;
        const questionId = req.params.id;

        // Check authorization
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        if (question.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this question'
            });
        }

        // Update question
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            {
                questionText: questionText || question.questionText,
                subject: subject || question.subject,
                difficulty: difficulty || question.difficulty,
                bloomLevel: bloomLevel || question.bloomLevel,
                options: options || question.options,
                correctAnswer: correctAnswer || question.correctAnswer,
                status: status || question.status,
                tags: tags || question.tags,
                explanation: explanation || question.explanation,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Question updated successfully',
            data: updatedQuestion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating question',
            error: error.message
        });
    }
};

// ===================================
// DELETE QUESTION
// ===================================

const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check authorization
        if (question.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this question'
            });
        }

        await Question.findByIdAndUpdate(
            req.params.id,
            { isActive: false }
        );

        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting question',
            error: error.message
        });
    }
};

// ===================================
// MERGE QUESTIONS
// ===================================

const mergeQuestions = async (req, res) => {
    try {
        const { originalId, duplicateId } = req.body;

        const original = await Question.findById(originalId);
        const duplicate = await Question.findById(duplicateId);

        if (!original || !duplicate) {
            return res.status(404).json({
                success: false,
                message: 'One or both questions not found'
            });
        }

        // Mark duplicate
        duplicate.similarity.duplicateOf = originalId;
        duplicate.status = 'archived';
        await duplicate.save();

        // Update original with similarity info
        original.similarity.similarQuestions.push({
            questionId: duplicateId,
            score: 1.0
        });
        await original.save();

        res.json({
            success: true,
            message: 'Questions merged successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error merging questions',
            error: error.message
        });
    }
};

// ===================================
// GET DASHBOARD STATISTICS
// ===================================

const getDashboardStats = async (req, res) => {
    try {
        const totalQuestions = await Question.countDocuments({ isActive: true });
        const subjects = await Question.distinct('subject', { isActive: true });
        const duplicateQuestions = await Question.countDocuments({ 'similarity.duplicateOf': { $exists: true, $ne: null } });
        
        res.json({
            success: true,
            data: {
                totalQuestions,
                totalSubjects: subjects.length,
                duplicateQuestions,
                aiPredictions: totalQuestions // Every question has AI meta in this project
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const subjectDistribution = await Question.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $project: { _id: 0, subject: '$_id', count: 1 } }
        ]);

        const difficultyDistribution = await Question.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$difficulty', count: { $sum: 1 } } },
            { $project: { _id: 0, difficulty: '$_id', count: 1 } }
        ]);

        const mostAskedTopics = await Question.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $project: { _id: 0, topic: '$_id', count: 1 } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                subjectDistribution,
                difficultyDistribution,
                mostAskedTopics,
                duplicatePercentage: Math.round((await Question.countDocuments({ 'similarity.duplicateOf': { $exists: true } }) / await Question.countDocuments({ isActive: true })) * 100) || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    mergeQuestions,
    getDashboardStats,
    getAnalytics
};
