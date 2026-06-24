// ===================================
// MODELS/QUESTION.JS - Question Model
// ===================================

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        minlength: 10
    },
    subject: {
        type: String,
        required: [true, 'Subject is required']
    },
    topic: String,
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    bloomLevel: {
        type: String,
        enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
        default: 'Understand'
    },
    options: [{
        letter: String,
        text: String,
        explanation: String
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: String,
    tags: [String],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    similarity: {
        duplicateOf: mongoose.Schema.Types.ObjectId,
        similarQuestions: [
            {
                questionId: mongoose.Schema.Types.ObjectId,
                score: Number
            }
        ]
    },
    ai: {
        predictedSubject: String,
        predictedDifficulty: String,
        predictedBloomLevel: String,
        suggestedTags: [String],
        quality: {
            clarity: Number,
            relevance: Number,
            difficulty: Number,
            depth: Number,
            engagement: Number,
            validity: Number
        }
    },
    views: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    avgTime: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for searching
questionSchema.index({ questionText: 'text', subject: 'text', topic: 'text' });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdBy: 1, createdAt: -1 });
questionSchema.index({ status: 1, subject: 1 });

// Create similar questions array if not exists
questionSchema.pre('save', function(next) {
    if (!this.similarity) {
        this.similarity = { similarQuestions: [] };
    }
    next();
});

module.exports = mongoose.model('Question', questionSchema);
