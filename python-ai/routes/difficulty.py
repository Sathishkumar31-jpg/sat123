# ===================================
# ROUTES/DIFFICULTY.PY - Difficulty Prediction Route
# ===================================

from flask import Blueprint, request, jsonify
import logging
from utils.nlp import analyze_text_complexity

logger = logging.getLogger(__name__)

difficulty_bp = Blueprint('difficulty', __name__, url_prefix='/difficulty')

# ===================================
# PREDICT DIFFICULTY
# ===================================

@difficulty_bp.route('', methods=['POST'])
def predict_difficulty():
    """
    Predict question difficulty level
    """
    try:
        data = request.get_json()
        question = data.get('question', '').strip()

        if not question:
            return jsonify({
                'success': False,
                'message': 'Question text is required'
            }), 400

        # Analyze complexity
        complexity = analyze_text_complexity(question)

        # Determine difficulty based on complexity metrics
        avg_word_length = complexity.get('avg_word_length', 0)
        total_words = complexity.get('total_words', 0)
        unique_ratio = complexity.get('unique_word_ratio', 0)

        # Scoring logic
        score = 0
        
        # Word length factor (more complex words = harder)
        if avg_word_length > 7:
            score += 3
        elif avg_word_length > 5:
            score += 2
        else:
            score += 1

        # Word count factor (more words = more complex)
        if total_words > 50:
            score += 3
        elif total_words > 25:
            score += 2
        else:
            score += 1

        # Vocabulary diversity factor
        if unique_ratio > 0.8:
            score += 2
        elif unique_ratio > 0.6:
            score += 1

        # Determine level
        if score >= 7:
            difficulty = 'Hard'
            confidence = 0.85
        elif score >= 4:
            difficulty = 'Medium'
            confidence = 0.80
        else:
            difficulty = 'Easy'
            confidence = 0.75

        return jsonify({
            'success': True,
            'data': {
                'difficulty': difficulty,
                'confidence': confidence,
                'score': score,
                'complexity_metrics': complexity
            }
        }), 200

    except Exception as e:
        logger.error(f"Error predicting difficulty: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error predicting difficulty',
            'error': str(e)
        }), 500
