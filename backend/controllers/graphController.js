// ===================================
// CONTROLLERS/GRAPHCONTROLLER.JS - Graph Controller
// ===================================

const Question = require('../models/Question');

// ===================================
// GET FULL GRAPH DATA
// ===================================

const getGraphData = async (req, res) => {
    try {
        const { subject, nodeType = 'all' } = req.query;
        
        const filter = { isActive: true };
        if (subject) filter.subject = subject;

        const questions = await Question.find(filter).lean();

        const nodes = [];
        const edges = [];
        const nodeMap = new Map();

        // 1. Create Question Nodes
        questions.forEach(q => {
            const nodeId = q._id.toString();
            nodes.push({
                id: nodeId,
                label: q.questionText.substring(0, 30) + '...',
                type: 'question',
                title: q.questionText,
                subject: q.subject
            });
            nodeMap.set(nodeId, true);
        });

        // 2. Create relationships based on similarity
        questions.forEach(q1 => {
            if (q1.similarity && q1.similarity.similarQuestions) {
                q1.similarity.similarQuestions.forEach(sim => {
                    const q2Id = sim.questionId.toString();
                    if (nodeMap.has(q2Id)) {
                        edges.push({
                            from: q1._id.toString(),
                            to: q2Id,
                            weight: (sim.score * 10) || 2
                        });
                    }
                });
            }
        });

        // 3. Create Topic/Subject Nodes if requested
        if (nodeType === 'all' || nodeType === 'subject') {
            const subjects = [...new Set(questions.map(q => q.subject))];
            subjects.forEach(s => {
                const sId = `subj_${s}`;
                nodes.push({
                    id: sId,
                    label: s,
                    type: 'subject'
                });

                // Connect questions to their subject
                questions.filter(q => q.subject === s).forEach(q => {
                    edges.push({
                        from: q._id.toString(),
                        to: sId,
                        weight: 1
                    });
                });
            });
        }

        res.json({
            success: true,
            data: {
                nodes,
                edges,
                totalNodes: nodes.length,
                totalEdges: edges.length,
                density: (edges.length / (nodes.length * (nodes.length - 1)) * 100) || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating graph data',
            error: error.message
        });
    }
};

// ===================================
// GET NODE DETAILS
// ===================================

const getNodeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (id.startsWith('subj_')) {
            const subjectName = id.replace('subj_', '');
            const count = await Question.countDocuments({ subject: subjectName, isActive: true });
            return res.json({
                success: true,
                data: {
                    label: subjectName,
                    type: 'subject',
                    relatedCount: count,
                    description: `This node represents the ${subjectName} subject academic area.`
                }
            });
        }

        const question = await Question.findById(id).populate('createdBy', 'name');
        if (!question) {
            return res.status(404).json({ success: false, message: 'Node not found' });
        }

        res.json({
            success: true,
            data: {
                label: question.questionText.substring(0, 50) + '...',
                type: 'question',
                relatedCount: question.similarity.similarQuestions.length,
                description: question.questionText,
                strength: Math.round(Math.random() * 40) + 60 // Mock strength for UI
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching node details',
            error: error.message
        });
    }
};

module.exports = {
    getGraphData,
    getNodeDetails
};
