// ===================================
// CONTROLLERS/AICONTROLLER.JS - AI Controller
// ===================================

const axios = require('axios');
const Question = require('../models/Question');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// ===================================
// ANALYZE QUESTION
// ===================================

const analyzeQuestion = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question text is required'
            });
        }

        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
            question
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('AI analysis error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error analyzing question',
            error: error.message
        });
    }
};

// ===================================
// FIND SIMILAR QUESTIONS
// ===================================

const findSimilarQuestions = async (req, res) => {
    try {
        const { question, threshold = 0.1, maxResults = 10 } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question text is required'
            });
        }

        const existingQuestions = await Question.find({ isActive: true }).lean();

        try {
            const response = await axios.post(`${AI_SERVICE_URL}/similarity`, {
                question,
                threshold,
                maxResults,
                questions: existingQuestions.map(q => ({
                    _id: q._id.toString(),
                    questionText: q.questionText,
                    subject: q.subject,
                    difficulty: q.difficulty,
                    options: q.options
                }))
            });

            return res.json({
                success: true,
                data: response.data
            });
        } catch (aiError) {
            console.warn('AI Service unreachable, using Demo Mode fallback...');
            
            // DEMO MODE FALLBACK: Simple keyword similarity
            // Improved to catch short technical terms (TCP, UDP, OS, etc.)
            const queryWords = question.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
            
            const results = existingQuestions.map(q => {
                const qWords = q.questionText.toLowerCase().split(/\s+/);
                const commonWords = queryWords.filter(w => qWords.some(qw => qw.includes(w) || w.includes(qw)));
                const similarity = commonWords.length / Math.max(queryWords.length, 1);
                
                return {
                    ...q,
                    similarity: similarity
                };
            })
            .filter(q => q.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxResults);

            // Special case for exact match demo
            const queryClean = question.toLowerCase().replace(/[^a-z0-9]/g, '');
            results.forEach(r => {
                const textClean = r.questionText.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (textClean.includes(queryClean) || queryClean.includes(textClean)) {
                    r.similarity = Math.max(r.similarity, 0.95);
                }
                if (textClean === queryClean) {
                    r.similarity = 1.0;
                }
            });

            return res.json({
                success: true,
                data: {
                    results: results.sort((a, b) => b.similarity - a.similarity).map(r => ({
                        _id: r._id,
                        questionText: r.questionText,
                        subject: r.subject,
                        difficulty: r.difficulty,
                        options: r.options,
                        similarity: r.similarity
                    }))
                }
            });
        }
    } catch (error) {
        console.error('Similarity search error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error finding similar questions',
            error: error.message
        });
    }
};

// ===================================
// PREDICT DIFFICULTY
// ===================================

const predictDifficulty = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question text is required'
            });
        }

        const response = await axios.post(`${AI_SERVICE_URL}/difficulty`, {
            question
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Difficulty prediction error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error predicting difficulty',
            error: error.message
        });
    }
};

// ===================================
// PREDICT SUBJECT
// ===================================

const predictSubject = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question text is required'
            });
        }

        const response = await axios.post(`${AI_SERVICE_URL}/subject`, {
            question
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Subject prediction error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error predicting subject',
            error: error.message
        });
    }
};

// ===================================
// PREDICT BLOOM LEVEL
// ===================================

const predictBloom = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question text is required'
            });
        }

        const response = await axios.post(`${AI_SERVICE_URL}/bloom`, {
            question
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Bloom prediction error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error predicting Bloom level',
            error: error.message
        });
    }
};

// ===================================
// AUTO-TAG QUESTIONS
// ===================================

const autoTag = async (req, res) => {
    try {
        const { questions } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Questions array is required'
            });
        }

        const response = await axios.post(`${AI_SERVICE_URL}/autotag/batch`, {
            questions
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Auto-tagging error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error auto-tagging questions',
            error: error.message
        });
    }
};

// ===================================
// FIND DUPLICATES
// ===================================

const findDuplicates = async (req, res) => {
    try {
        const { threshold = 0.8 } = req.body;

        const response = await axios.post(`${AI_SERVICE_URL}/duplicates`, {
            threshold
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Duplicate detection error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error detecting duplicates',
            error: error.message
        });
    }
};

module.exports = {
    analyzeQuestion,
    findSimilarQuestions,
    predictDifficulty,
    predictSubject,
    predictBloom,
    autoTag,
    findDuplicates
};
