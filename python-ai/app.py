# ===================================
# PYTHON AI MICROSERVICE - MAIN APP
# ===================================

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)

# ===================================
# IMPORT ROUTES
# ===================================

from routes.analyze import analyze_bp
from routes.similarity import similarity_bp
from routes.difficulty import difficulty_bp
from routes.subject import subject_bp
from routes.bloom import bloom_bp
from routes.autotag import autotag_bp
from routes.duplicates import duplicates_bp

# ===================================
# REGISTER BLUEPRINTS
# ===================================

app.register_blueprint(analyze_bp)
app.register_blueprint(similarity_bp)
app.register_blueprint(difficulty_bp)
app.register_blueprint(subject_bp)
app.register_blueprint(bloom_bp)
app.register_blueprint(autotag_bp)
app.register_blueprint(duplicates_bp)

# ===================================
# HEALTH CHECK
# ===================================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': 'AI Service is running',
        'timestamp': str(__import__('datetime').datetime.now())
    }), 200

# ===================================
# ERROR HANDLERS
# ===================================

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'message': 'Bad request',
        'error': str(error)
    }), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Route not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal error: {str(error)}')
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'error': str(error) if os.getenv('DEBUG') == 'True' else None
    }), 500

# ===================================
# MAIN
# ===================================

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5001))
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    
    logger.info(f'Starting AI Service on port {PORT}')
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=DEBUG
    )
