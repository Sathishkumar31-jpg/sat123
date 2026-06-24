// ===================================
// CONTROLLERS/ANALYTICSCONTROLLER.JS - Analytics Controller
// ===================================

const Question = require('../models/Question');

// ===================================
// GET ANALYTICS DATA
// ===================================

const getAnalytics = async (req, res) => {
    try {
        const { fromDate, toDate, subject } = req.query;
        const userId = req.user.userId;

        const filter = { createdBy: userId, isActive: true };
        
        if (fromDate && toDate) {
            filter.createdAt = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }
        
        if (subject) {
            filter.subject = subject;
        }

        const questions = await Question.find(filter).lean();

        // 1. Calculate Summary Stats
        const total = questions.length;
        let diffSum = 0;
        let bloomSum = 0;
        
        const difficultyMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        const bloomMap = { 'Remember': 1, 'Understand': 2, 'Apply': 3, 'Analyze': 4, 'Evaluate': 5, 'Create': 6 };

        questions.forEach(q => {
            diffSum += difficultyMap[q.difficulty] || 2;
            bloomSum += bloomMap[q.bloomLevel] || 2;
        });

        const avgDifficulty = total > 0 ? diffSum / total : 0;
        const avgBloomLevel = total > 0 ? bloomSum / total : 0;

        // 2. Timeline Data (Grouped by Date)
        const timeline = {};
        questions.forEach(q => {
            const date = q.createdAt.toISOString().split('T')[0];
            timeline[date] = (timeline[date] || 0) + 1;
        });

        // 3. Bloom Data Distribution
        const bloomDist = { 'Remember': 0, 'Understand': 0, 'Apply': 0, 'Analyze': 0, 'Evaluate': 0, 'Create': 0 };
        questions.forEach(q => {
            if (bloomDist.hasOwnProperty(q.bloomLevel)) {
                bloomDist[q.bloomLevel]++;
            }
        });

        // 4. Performance Metrics (Mock for visualization)
        const perfScores = [
            Math.floor(Math.random() * 20 + 75), // Clarity
            Math.floor(Math.random() * 20 + 75), // Relevance
            Math.floor(Math.random() * 20 + 75), // Difficulty
            Math.floor(Math.random() * 20 + 75), // Depth
            Math.floor(Math.random() * 20 + 75), // Engagement
            Math.floor(Math.random() * 20 + 75)  // Validity
        ];

        res.json({
            success: true,
            data: {
                averageDifficulty: avgDifficulty,
                averageBloomLevel: avgBloomLevel,
                similarityIndex: Math.floor(Math.random() * 30 + 10), // Mock index
                averageScore: 85,
                timelineData: {
                    labels: Object.keys(timeline).sort(),
                    values: Object.keys(timeline).sort().map(k => timeline[k])
                },
                bloomData: {
                    levels: Object.keys(bloomDist),
                    counts: Object.values(bloomDist)
                },
                performanceData: {
                    scores: perfScores
                },
                typeData: {
                    types: ['Multiple Choice', 'Short Answer', 'Essay', 'True/False'],
                    counts: [total, 0, 0, 0] // Currently only MCQ-like structure supported in simplified model
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating analytics',
            error: error.message
        });
    }
};

module.exports = {
    getAnalytics
};
