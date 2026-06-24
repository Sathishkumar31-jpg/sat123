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

        res.json(response.data);
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
        const { question, threshold = 0.3, maxResults = 10 } = req.body;

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

            return res.json(response.data);
        } catch (aiError) {
            console.warn('AI Service unreachable, using Demo Mode fallback...');
            
            // DEMO MODE FALLBACK: Simple keyword similarity
            // Improved to exclude common stop words and handle word variations
            const stopwords = ['what', 'is', 'the', 'of', 'in', 'and', 'to', 'for', 'a', 'an', 'which', 'who', 'how', 'why', 'whose', 'whom', 'where', 'when', 'are'];
            const queryWords = question.toLowerCase()
                .split(/\s+/)
                .filter(w => w.length >= 2 && !stopwords.includes(w));
            
            const results = existingQuestions.map(q => {
                const qText = q.questionText.toLowerCase();
                const qWords = qText.split(/\s+/);
                
                // Check for keyword matches
                const matches = queryWords.filter(w => {
                    // Match whole word or significant part
                    return qWords.some(qw => qw === w || (qw.length > 3 && qw.includes(w)) || (w.length > 3 && w.includes(qw)));
                });
                
                const similarity = queryWords.length > 0 ? (matches.length / queryWords.length) : 0;
                
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

        res.json(response.data);
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

        res.json(response.data);
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

        res.json(response.data);
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

        res.json(response.data);
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
        const { threshold = 0.85 } = req.body;

        // Fetch all active questions from DB
        const questions = await Question.find({ isActive: true })
            .select('questionText subject difficulty')
            .lean();

        const response = await axios.post(`${AI_SERVICE_URL}/similarity/find`, {
            questions,
            threshold
        });

        res.json(response.data);
    } catch (error) {
        console.error('Duplicate detection error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error detecting duplicates',
            error: error.message
        });
    }
};

const markAsDuplicate = async (req, res) => {
    try {
        const { primaryId, duplicateId } = req.body;

        if (!primaryId || !duplicateId) {
            return res.status(400).json({
                success: false,
                message: 'Both primaryId and duplicateId are required'
            });
        }

        const Question = require('../models/Question');
        
        // Update the duplicate question
        await Question.findByIdAndUpdate(duplicateId, {
            'similarity.duplicateOf': primaryId,
            isActive: false // Optionally deactivate it
        });

        res.json({
            success: true,
            message: 'Question marked as duplicate successfully'
        });
    } catch (error) {
        console.error('Error marking duplicate:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error marking duplicate',
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
    findDuplicates,
    markAsDuplicate
};
