# SQAIP Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Node.js v16+
- Python 3.8+
- MongoDB running locally

### Terminal 1: MongoDB
```bash
# Ensure MongoDB is running
mongosh
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:8000
```

### Terminal 3: Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:5000
```

### Terminal 4: AI Service
```bash
cd python-ai
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5001
```

## 📱 Access the Platform

Open browser: **http://localhost:8000**

### Test Account
- Email: test@example.com
- Password: password123

*(Register a new account if needed)*

## 📋 Project Overview

### Frontend (15 Pages)
- 🏠 Landing page with hero section
- 🔐 Login & Registration
- 📊 Dashboard with statistics
- ❓ Questions list with filters
- ✏️ Add/Edit questions with AI suggestions
- 🔄 Similarity finder
- 🏷️ Auto-tagging tool
- 📈 Difficulty predictor
- 🎓 Subject classifier
- 🔍 Duplicate detector
- 📚 Bloom taxonomy classifier
- 🕸️ Knowledge graph visualization
- 📉 Advanced analytics
- 👤 User profile & settings

### Backend Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/verify
GET    /api/questions
POST   /api/questions
GET    /api/questions/:id
PUT    /api/questions/:id
DELETE /api/questions/:id
```

### AI Services
```
POST /analyze          - Question analysis
POST /similarity       - Find similar questions
POST /difficulty       - Difficulty prediction
POST /subject          - Subject classification
POST /bloom            - Bloom level prediction
POST /autotag          - Auto-tagging
POST /duplicates       - Duplicate detection
```

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI | Python, Flask, NLP (NLTK, scikit-learn) |
| Database | MongoDB |
| Authentication | JWT |

## 📚 File Structure

```
round 2/
├── frontend/          # 15 HTML pages + CSS + JavaScript
├── backend/           # Express API server + MongoDB models
├── python-ai/         # Flask AI microservice
├── README.md          # Full documentation
├── INSTALLATION.md    # Detailed setup guide
└── QUICKSTART.md      # This file
```

## 🧪 Quick Tests

### Test Frontend
```bash
# Try login page
http://localhost:8000/login.html

# Try register
http://localhost:8000/register.html
```

### Test Backend API
```bash
# Check if running
curl http://localhost:5000/api/health

# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123","confirmPassword":"password123"}'
```

### Test AI Service
```bash
# Check if running
curl http://localhost:5001/health

# Test analysis
curl -X POST http://localhost:5001/analyze \
  -H "Content-Type: application/json" \
  -d '{"question":"What is 2+2?"}'
```

## 🔧 Common Commands

### Stop Services
```bash
# Terminal: Ctrl + C
```

### Restart Services
```bash
# Kill all Node processes
killall node

# Kill Python process
# Or simply Ctrl + C in each terminal
```

### Clear Database
```bash
mongosh
> use sqaip
> db.dropDatabase()
```

### View Database
```bash
mongosh
> use sqaip
> db.users.find()
> db.questions.find()
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Connection refused` | Ensure MongoDB is running: `mongosh` |
| `Port already in use` | Change PORT in .env or kill existing process |
| `Module not found` | Run `npm install` or `pip install -r requirements.txt` |
| `CORS error` | Check CORS_ORIGIN in backend .env |
| `Authentication failed` | Verify JWT_SECRET in .env |

## 📖 Learn More

- **Full README**: See `README.md` for complete documentation
- **Installation Guide**: See `INSTALLATION.md` for detailed setup
- **API Documentation**: Check backend routes for endpoints
- **Frontend Pages**: Explore HTML files in `frontend/` directory

## 🎯 Next Steps

1. ✅ Start all services
2. 🔐 Register a test account
3. 📝 Create a sample question
4. 🔍 Try similarity search
5. 📊 Check analytics dashboard
6. 🤖 Explore AI features
7. 📚 Read full documentation

## 💡 Pro Tips

- **Frontend**: Press F12 for developer tools, check Network tab for API calls
- **Backend**: Check terminal for request logs and errors
- **Database**: Use MongoDB Compass for GUI interface
- **API Testing**: Use Postman for advanced testing
- **Development**: Use `npm run dev` for auto-restart on file changes

## 📞 Support

For detailed help:
- 📖 Check README.md
- 🔧 Check INSTALLATION.md
- 🐛 Check browser console for frontend errors
- 📝 Check terminal output for server errors

---

**Happy coding! 🚀**

Last Updated: 2024
Version: 1.0.0
