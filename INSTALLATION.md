# SQAIP Installation & Setup Guide

## Complete Installation Instructions

This guide provides step-by-step instructions to set up the Smart Academic Question Intelligence Platform (SQAIP) on your local machine or server.

## Prerequisites

Before starting, ensure you have installed:

### System Requirements
- **Node.js**: v16.0.0 or higher ([download](https://nodejs.org/))
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Python**: v3.8 or higher ([download](https://www.python.org/))
- **pip**: Latest version (comes with Python)
- **MongoDB**: v5.0 or higher ([download](https://www.mongodb.com/try/download/community))
- **Git**: For cloning the repository

### Verify Installations

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check Python
python --version

# Check pip
pip --version

# Check MongoDB (after installation)
mongosh --version
```

## Step 1: MongoDB Setup

### Windows

1. Download MongoDB Community Server
2. Run the installer and follow the wizard
3. MongoDB will run as a Windows service by default
4. Verify connection:
```bash
mongosh
> db.version()
```

### macOS

```bash
# Using Homebrew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh
```

### Linux

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Verify
mongosh
```

## Step 2: Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
ls node_modules
npm list bootstrap chart.js
```

### 4. Start Development Server
```bash
npm start
```

Frontend will be available at: `http://localhost:8000`

**Note**: For production, use:
```bash
npm run serve
```

## Step 3: Backend Setup

### 1. Navigate to Backend Directory
```bash
cd ../backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your configuration
# On Windows, you can use Notepad:
notepad .env
```

### 4. Update .env File

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sqaip

# JWT Configuration
JWT_SECRET=change-this-to-random-secret-key-in-production
JWT_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:8000

# AI Service Configuration
AI_SERVICE_URL=http://localhost:5001

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 5. Create Upload Directory
```bash
mkdir uploads
```

### 6. Start Backend Server

**Development Mode** (with auto-restart on file changes):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Backend will be available at: `http://localhost:5000`

### 7. Verify Backend

```bash
# In another terminal, test the health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"success","message":"Server is running",...}
```

## Step 4: Python AI Service Setup

### 1. Navigate to Python AI Directory
```bash
cd ../python-ai
```

### 2. Create Virtual Environment (Recommended)

**Windows**:
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux**:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

**Note**: First-time installation downloads NLTK data (~700MB)

### 4. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
# On Windows:
notepad .env
# On macOS/Linux:
nano .env
```

### 5. Update .env File

```env
DEBUG=False
ENVIRONMENT=production
PORT=5001
HOST=0.0.0.0
FLASK_ENV=production
FLASK_APP=app.py
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:8000,http://localhost:5000
```

### 6. Download NLP Models

On first run, the application will download NLTK data. You can pre-download:

```bash
python -m nltk.downloader punkt stopwords wordnet
```

### 7. Start AI Service

```bash
python app.py
```

AI Service will be available at: `http://localhost:5001`

### 8. Verify AI Service

```bash
# In another terminal, test the health endpoint
curl http://localhost:5001/health

# Expected response:
# {"status":"success","message":"AI Service is running",...}
```

## Step 5: Verify Full Integration

Once all three services are running:

### Test Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test AI Analysis

```bash
curl -X POST http://localhost:5001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the capital of France?"
  }'
```

### Access Frontend

Open your browser and navigate to:
```
http://localhost:8000
```

Login with the test credentials you created.

## Troubleshooting

### MongoDB Connection Issues

**Error**: `connection refused`

**Solution**:
```bash
# Check if MongoDB is running
# Windows: Check Services
# macOS/Linux:
sudo systemctl status mongod

# If not running, start it:
sudo systemctl start mongod
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process and retry
```

### Python Package Installation Issues

**Error**: `pip install failed`

**Solution**:
```bash
# Upgrade pip
pip install --upgrade pip

# Try installation again
pip install -r requirements.txt

# If still fails, install specific packages:
pip install Flask==2.3.2
pip install Flask-CORS==4.0.0
# ... (repeat for each package)
```

### NLTK Data Download Issues

**Error**: `Resource punkt not found`

**Solution**:
```bash
# Download required NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

# Or manually specify data path:
python -c "import nltk; nltk.download('punkt', download_dir='/path/to/nltk_data')"
```

### CORS Errors in Browser Console

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
1. Verify CORS_ORIGIN in backend .env matches frontend URL
2. Restart backend server
3. Clear browser cache and cookies
4. Check that all three services are running

## Development Tools

### MongoDB GUI Tools

- **MongoDB Compass** ([download](https://www.mongodb.com/products/tools/compass))
  - Graphical interface for MongoDB
  - View databases, collections, and documents

- **mongosh** (command line)
  ```bash
  mongosh
  > use sqaip
  > db.users.find()
  > db.questions.find()
  ```

### API Testing Tools

- **Postman** ([download](https://www.postman.com/))
  - Import API endpoints
  - Test requests and responses
  - Create test collections

- **curl** (command line)
  ```bash
  curl -X GET http://localhost:5000/api/questions
  ```

### Code Editors

- **Visual Studio Code** ([download](https://code.visualstudio.com/))
  - Recommended extensions:
    - ES7+ React/Redux/React-Native snippets
    - Python
    - MongoDB for VS Code
    - Thunder Client (API testing)

## Production Deployment

### Using Environment Variables

Always use environment variables for sensitive data:

```bash
# Set environment variable (not in code)
export JWT_SECRET="your-production-secret-key"
export MONGODB_URI="mongodb://production-server:27017/sqaip"
export NODE_ENV="production"
```

### Backend Deployment (Using Gunicorn)

```bash
# Install Gunicorn
pip install gunicorn

# Run backend with Gunicorn
gunicorn --workers 4 --bind 0.0.0.0:5000 server:app
```

### AI Service Deployment

```bash
# Run AI service with Gunicorn
gunicorn --workers 4 --bind 0.0.0.0:5001 app:app
```

### Using Docker (Optional)

Create `Dockerfile` in backend directory:

```dockerfile
FROM node:16

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t sqaip-backend .
docker run -p 5000:5000 sqaip-backend
```

## Database Backup & Restore

### Backup MongoDB

```bash
# Backup all databases
mongodump --out backup/

# Backup specific database
mongodump --db sqaip --out backup/sqaip/
```

### Restore MongoDB

```bash
# Restore all databases
mongorestore backup/

# Restore specific database
mongorestore --db sqaip backup/sqaip/
```

## Performance Optimization

### Enable MongoDB Indexing

```bash
mongosh
> use sqaip
> db.questions.createIndex({ questionText: "text", tags: 1, subject: 1 })
> db.questions.createIndex({ createdBy: 1, createdAt: -1 })
```

### Clear Application Cache

```bash
# Frontend (browser)
# Press F12, go to Application tab, clear Storage

# Backend cache
rm -rf node_modules/
npm install

# Python cache
rm -rf python-ai/__pycache__/
rm -rf python-ai/.pytest_cache/
```

## Security Checklist

Before Production:

- [ ] Change JWT_SECRET to a strong random key
- [ ] Update MONGODB_URI to production database
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL certificates
- [ ] Set CORS_ORIGIN to production domain only
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Enable database authentication
- [ ] Create database backups
- [ ] Review security headers
- [ ] Enable password hashing (already configured)
- [ ] Set up error monitoring (Sentry, etc.)

## Support & Documentation

- **Issues**: Check GitHub issues
- **Documentation**: See README.md
- **API Docs**: Check API endpoint documentation
- **Community**: Join development discussions

## Next Steps

1. ✅ All services running successfully
2. 📝 Read the README.md for feature overview
3. 🔐 Set up production environment variables
4. 📊 Explore the dashboard and features
5. 🧪 Run tests to verify functionality
6. 📚 Review API documentation
7. 🚀 Deploy to production

Congratulations! You have successfully set up SQAIP! 🎉
