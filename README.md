# Smart Academic Question Intelligence Platform (SQAIP)

## Overview

SQAIP is a comprehensive platform for creating, managing, and analyzing academic questions using modern web technologies and AI/ML capabilities. The platform provides intelligent features including question analysis, similarity detection, difficulty prediction, Bloom taxonomy classification, and duplicate detection.

## 🏗️ Architecture

The platform consists of three main components:

### 1. **Frontend** (HTML5/CSS3/JavaScript)
- Modern Glassmorphism UI with dark mode
- 15 responsive pages
- Real-time data updates with Fetch API
- Chart visualization with Chart.js
- Knowledge graph with Vis.js

### 2. **Backend** (Node.js/Express/MongoDB)
- RESTful API endpoints
- JWT authentication
- MongoDB database integration
- Question CRUD operations
- AI microservice integration

### 3. **AI Microservice** (Python/Flask)
- NLP-based question analysis
- Semantic similarity detection
- Difficulty prediction
- Subject classification
- Bloom taxonomy prediction
- Auto-tagging functionality

## 📋 Project Structure

```
round 2/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── questions.html
│   ├── add-question.html
│   ├── edit-question.html
│   ├── similarity.html
│   ├── autotag.html
│   ├── difficulty.html
│   ├── subject.html
│   ├── duplicate.html
│   ├── bloom.html
│   ├── graph.html
│   ├── analytics.html
│   ├── profile.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── questions.js
│   │   ├── analytics.js
│   │   ├── graph.js
│   │   └── similarity.js
│   ├── assets/
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Question.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questionController.js
│   │   └── aiController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   └── aiRoutes.js
│   └── uploads/
│
└── python-ai/
    ├── app.py
    ├── requirements.txt
    ├── .env.example
    ├── utils/
    │   └── nlp.py
    ├── routes/
    │   ├── analyze.py
    │   ├── similarity.py
    │   ├── difficulty.py
    │   ├── subject.py
    │   ├── bloom.py
    │   ├── autotag.py
    │   └── duplicates.py
    └── models/
        └── trained_models/
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB 5.0+
- npm/pip package managers

### 1. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:8000` (or configure port as needed)

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. AI Microservice Setup

```bash
cd python-ai
pip install -r requirements.txt
cp .env.example .env
python app.py
```

AI service runs on `http://localhost:5001`

## 📚 Frontend Pages

| Page | Path | Features |
|------|------|----------|
| Landing | `/` | Hero section, features overview |
| Login | `/login.html` | Email/password authentication |
| Register | `/register.html` | User registration form |
| Dashboard | `/dashboard.html` | Statistics, recent questions, charts |
| Questions | `/questions.html` | List, filter, search, pagination |
| Add Question | `/add-question.html` | Create new question with AI analysis |
| Edit Question | `/edit-question.html` | Modify existing question |
| Similarity | `/similarity.html` | Find similar questions |
| Auto-Tag | `/autotag.html` | Automatic question tagging |
| Difficulty | `/difficulty.html` | Predict question difficulty |
| Subject | `/subject.html` | Classify question subject |
| Duplicate Detection | `/duplicate.html` | Find and manage duplicates |
| Bloom Taxonomy | `/bloom.html` | Classify by Bloom level |
| Knowledge Graph | `/graph.html` | Visualize question relationships |
| Analytics | `/analytics.html` | Advanced analytics dashboard |
| Profile | `/profile.html` | User settings and preferences |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/merge` - Merge duplicate questions
- `GET /api/questions/dashboard-stats` - Dashboard statistics

### AI Services
- `POST /api/ai/analyze` - Analyze question
- `POST /api/ai/similarity` - Find similar questions
- `POST /api/ai/difficulty` - Predict difficulty
- `POST /api/ai/subject` - Classify subject
- `POST /api/ai/bloom` - Predict Bloom level
- `POST /api/ai/autotag` - Auto-tag questions
- `POST /api/ai/duplicates` - Find duplicates

## 🎨 Design System

### Colors
- Primary: `#667eea` (Blue)
- Secondary: `#764ba2` (Purple)
- Success: `#48bb78` (Green)
- Danger: `#f56565` (Red)
- Warning: `#ed8936` (Orange)

### Typography
- Font Stack: System fonts (San Francisco, Segoe UI, etc.)
- Sizes: 12px to 32px
- Weights: 400, 500, 600, 700

### Components
- Buttons (6 variants)
- Cards (glassmorphic)
- Forms with validation
- Tables with pagination
- Charts (Line, Bar, Doughnut, Radar)
- Modals and alerts
- Navigation (sidebar + topbar)

## 🔐 Authentication

The platform uses JWT (JSON Web Tokens) for authentication:

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header with each request
5. Backend validates token before processing requests

## 📊 Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/teacher/admin),
  preferences: Object,
  statistics: Object,
  lastLogin: Date
}
```

### Question Schema
```javascript
{
  questionText: String,
  subject: String,
  difficulty: String (Easy/Medium/Hard),
  bloomLevel: String,
  options: Array,
  correctAnswer: String,
  tags: Array,
  status: String (draft/published/archived),
  createdBy: ObjectId (User),
  similarity: Object,
  ai: Object,
  views: Number,
  attempts: Number
}
```

## 🧠 AI Features

### Question Analysis
Analyzes question text to suggest:
- Subject classification
- Difficulty level
- Bloom taxonomy level
- Relevant tags
- Quality metrics

### Similarity Detection
Finds semantically similar questions using:
- TF-IDF vectorization
- Cosine similarity
- Configurable threshold

### Difficulty Prediction
Predicts difficulty based on:
- Word length
- Word count
- Vocabulary diversity
- Complexity metrics

### Subject Classification
Classifies questions into:
- Mathematics
- Science (Physics, Chemistry, Biology)
- History
- Literature
- Geography
- Economics
- Computer Science

### Bloom Level Classification
Maps questions to Bloom's taxonomy levels:
- Remember
- Understand
- Apply
- Analyze
- Evaluate
- Create

## 📈 Charts and Visualizations

### Dashboard Charts
- Subject Distribution (Doughnut)
- Difficulty Distribution (Bar)
- Duplicate Detected (Doughnut)
- Topics Distribution (Horizontal Bar)

### Analytics Charts
- Timeline (Line Chart)
- Bloom Distribution (Horizontal Bar)
- Question Type Distribution (Doughnut)
- Performance Metrics (Radar)

### Knowledge Graph
- Node-based visualization using Vis.js
- Interactive network exploration
- Color-coded by type
- Drag, zoom, and filter capabilities

## 🔧 Configuration

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sqaip
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
AI_SERVICE_URL=http://localhost:5001
```

### Python AI (.env)
```
DEBUG=False
PORT=5001
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Python Tests
```bash
cd python-ai
pytest
```

## 📦 Dependencies

### Frontend
- Bootstrap 5.3.0
- Chart.js 3.9.1
- Vis.js 4.21.0
- Font Awesome 6.4.0

### Backend
- Express 4.18.2
- Mongoose 7.0.0
- JWT 9.0.0
- bcrypt 5.1.0

### Python AI
- Flask 2.3.2
- NLTK 3.8.1
- scikit-learn 1.3.0
- NumPy 1.24.3

## 🚨 Error Handling

The platform includes comprehensive error handling:
- Form validation with user-friendly messages
- Toast notifications for feedback
- Modal dialogs for confirmations
- API error responses with detailed messages
- Logging for debugging

## 🔒 Security

- Password hashing with bcrypt
- JWT token validation
- CORS configuration
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection

## 📝 API Response Format

All API responses follow a standard format:

```json
{
  "success": true/false,
  "message": "Description",
  "data": {}
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- Check documentation wiki

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced ML models
- [ ] Integration with learning management systems
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] User roles and permissions
- [ ] Question versioning
- [ ] API rate limiting

## 📚 Additional Resources

- [Bootstrap Documentation](https://getbootstrap.com/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Vis.js Documentation](https://visjs.github.io/vis-network/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [NLTK Documentation](https://www.nltk.org/)
