# ===================================
# ROUTES/BLOOM.PY - Bloom Taxonomy Classification Route
# ===================================

from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)

bloom_bp = Blueprint('bloom', __name__, url_prefix='/bloom')

# Bloom level keywords
BLOOM_LEVELS = {
    'Remember': {
        'keywords': ['define', 'list', 'name', 'recall', 'state', 'identify', 'label', 'memorize', 'repeat', 'what'],
        'description': 'Ability to recall or recognize information'
    },
    'Understand': {
        'keywords': ['explain', 'describe', 'summarize', 'discuss', 'interpret', 'classify', 'compare', 'exemplify', 'why', 'how'],
        'description': 'Ability to explain ideas or concepts'
    },
    'Apply': {
        'keywords': ['apply', 'solve', 'demonstrate', 'use', 'calculate', 'execute', 'implement', 'show', 'illustrate', 'construct'],
        'description': 'Ability to use information in new situations'
    },
    'Analyze': {
        'keywords': ['analyze', 'compare', 'contrast', 'distinguish', 'categorize', 'differentiate', 'examine', 'investigate', 'break down'],
        'description': 'Ability to draw connections among ideas'
    },
    'Evaluate': {
        'keywords': ['justify', 'critique', 'judge', 'evaluate', 'argue', 'debate', 'assess', 'defend', 'appraise', 'determine'],
        'description': 'Ability to justify a stand or decision'
    },
    'Create': {
        'keywords': ['design', 'create', 'develop', 'hypothesize', 'propose', 'invent', 'produce', 'compose', 'formulate', 'generate'],
        'description': 'Ability to create new product or point of view'
    }
}

# ===================================
# PREDICT BLOOM LEVEL
# ===================================

@bloom_bp.route('', methods=['POST'])
def predict_bloom():
    """
    Predict Bloom taxonomy level for a question
    """
    try:
        data = request.get_json()
        question = data.get('question', '').strip()

        if not question:
            return jsonify({
                'success': False,
                'message': 'Question text is required'
            }), 400

        # Convert to lowercase
        text_lower = question.lower()

        # Score each Bloom level
        bloom_scores = {}
        for level, level_data in BLOOM_LEVELS.items():
            score = 0
            keywords = level_data['keywords']
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
            bloom_scores[level] = score

        # Determine predicted level
        if any(bloom_scores.values()):
            predicted_level = max(bloom_scores, key=bloom_scores.get)
            max_score = bloom_scores[predicted_level]
            confidence = min(0.95, (max_score / 5) * 0.9)  # Normalize by typical keyword count
        else:
            predicted_level = 'Remember'
            confidence = 0.5

        # Get details
        level_info = BLOOM_LEVELS[predicted_level]

        # Calculate all level details
        all_levels = []
        for level in ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']:
            level_data = BLOOM_LEVELS[level]
            all_levels.append({
                'level': level,
                'description': level_data['description'],
                'score': bloom_scores.get(level, 0),
                'is_predicted': level == predicted_level
            })

        return jsonify({
            'success': True,
            'data': {
                'bloomLevel': predicted_level,
                'confidence': float(confidence),
                'description': level_info['description'],
                'allLevels': all_levels,
                'scores': bloom_scores
            }
        }), 200

    except Exception as e:
        logger.error(f"Error predicting Bloom level: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error predicting Bloom level',
            'error': str(e)
        }), 500

# ===================================
# GET BLOOM LEVEL DESCRIPTIONS
# ===================================

@bloom_bp.route('/descriptions', methods=['GET'])
def get_descriptions():
    """
    Get descriptions for all Bloom levels
    """
    try:
        descriptions = []
        for level in ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']:
            descriptions.append({
                'level': level,
                'description': BLOOM_LEVELS[level]['description'],
                'keywords': BLOOM_LEVELS[level]['keywords']
            })

        return jsonify({
            'success': True,
            'data': descriptions
        }), 200

    except Exception as e:
        logger.error(f"Error getting descriptions: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error getting descriptions',
            'error': str(e)
        }), 500
