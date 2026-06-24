# ===================================
# ROUTES/SIMILARITY.PY - Similarity Detection Route
# ===================================

from flask import Blueprint, request, jsonify
import logging
from utils.nlp import find_similar_questions, compute_similarity

logger = logging.getLogger(__name__)

similarity_bp = Blueprint('similarity', __name__, url_prefix='/similarity')

# In production, this would be fetched from MongoDB
mock_questions = [
    {
        '_id': '1',
        'questionText': 'What is the capital of France?',
        'subject': 'Geography',
        'difficulty': 'Easy',
        'options': [
            {'letter': 'A', 'text': 'Paris'},
            {'letter': 'B', 'text': 'London'},
            {'letter': 'C', 'text': 'Berlin'},
            {'letter': 'D', 'text': 'Madrid'}
        ]
    },
    {
        '_id': '2',
        'questionText': 'Which European capital city is Paris?',
        'subject': 'Geography',
        'difficulty': 'Easy',
        'options': [
            {'letter': 'A', 'text': 'France'},
            {'letter': 'B', 'text': 'Italy'},
            {'letter': 'C', 'text': 'Spain'},
            {'letter': 'D', 'text': 'Germany'}
        ]
    },
    {
        '_id': '3',
        'questionText': 'Name the capital of Italy?',
        'subject': 'Geography',
        'difficulty': 'Easy',
        'options': [
            {'letter': 'A', 'text': 'Rome'},
            {'letter': 'B', 'text': 'Venice'},
            {'letter': 'C', 'text': 'Florence'},
            {'letter': 'D', 'text': 'Milan'}
        ]
    }
]

# ===================================
# FIND SIMILAR QUESTIONS
# ===================================

@similarity_bp.route('', methods=['POST'])
def find_similar():
    """
    Find similar questions from database
    """
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        threshold = float(data.get('threshold', 0.7)) / 100  # Convert percentage to decimal
        max_results = int(data.get('maxResults', 10))

        if not question:
            return jsonify({
                'success': False,
                'message': 'Question text is required'
            }), 400

        # Get questions from request or use mocks if not provided
        questions_list = data.get('questions', mock_questions)

        # Find similar questions
        similar = find_similar_questions(
            question,
            questions_list,
            threshold=threshold,
            max_results=max_results
        )

        results = []
        for item in similar:
            q = item['question']
            results.append({
                '_id': q['_id'],
                'questionText': q['questionText'],
                'subject': q['subject'],
                'difficulty': q['difficulty'],
                'options': q['options'],
                'similarity': item['similarity']
            })

        return jsonify({
            'success': True,
            'data': {
                'results': results,
                'count': len(results)
            }
        }), 200

    except Exception as e:
        logger.error(f"Error finding similar questions: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error finding similar questions',
            'error': str(e)
        }), 500

# ===================================
# COMPUTE SIMILARITY SCORE
# ===================================

@similarity_bp.route('/score', methods=['POST'])
def compute_score():
    """
    Compute similarity score between two questions
    """
    try:
        data = request.get_json()
        question1 = data.get('question1', '').strip()
        question2 = data.get('question2', '').strip()

        if not question1 or not question2:
            return jsonify({
                'success': False,
                'message': 'Both question texts are required'
            }), 400

        score = compute_similarity(question1, question2)

        return jsonify({
            'success': True,
            'data': {
                'similarity': float(score),
                'percentile': float(score * 100)
            }
        }), 200

    except Exception as e:
        logger.error(f"Error computing similarity: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error computing similarity',
            'error': str(e)
        }), 500
