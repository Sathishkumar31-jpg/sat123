const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sqaip');
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.find(c => c.name === 'questions')) {
      console.log('Dropping all indexes on questions collection...');
      await mongoose.connection.db.collection('questions').dropIndexes();
      console.log('Indexes dropped successfully');
    } else {
      console.log('Questions collection does not exist yet');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixIndexes();
