// ===================================
// CONFIG/DB.JS - Database Configuration
// ===================================

module.exports = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sqaip',
    mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    }
};
