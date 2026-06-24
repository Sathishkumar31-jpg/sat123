// ===================================
// SERVER.JS - Main Entry Point
// ===================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ===================================
// MIDDLEWARE
// ===================================

app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===================================
// DATABASE CONNECTION
// ===================================

const dbConfig = require('./config/db');
mongoose.connect(dbConfig.mongoURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    });

// ===================================
// ROUTES
// ===================================

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const graphRoutes = require('./routes/graphRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/analytics', analyticsRoutes);

// ===================================
// HEALTH CHECK
// ===================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// ===================================
// ERROR HANDLING
// ===================================

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ===================================
// START SERVER
// ===================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close();
        process.exit(0);
    });
});

module.exports = app;
