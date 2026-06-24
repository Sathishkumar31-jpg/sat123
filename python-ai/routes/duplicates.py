# ===================================
# ROUTES/DUPLICATES.PY - Duplicate Detection Route
# ===================================

from flask import Blueprint, request, jsonify
import logging
from utils.nlp import find_similar_questions, compute_similarity

logger = logging.getLogger(__name__)

duplicates_bp = Blueprint('duplicates', __name__, url_prefix='/duplicates')

# Mock database of questions
QUESTIONS_DATABASE = [
    {
        '_id': '1',
        'questionText': 'What is the capital of France?',
        'subject': 'Geography',
        'difficulty': 'Easy'
    },
    {
        '_id': '2',
        'questionText': 'What is the capital of France? Name it.',
        'subject': 'Geography',
        'difficulty': 'Easy'
    },
    {
        '_id': '3',
        'questionText': 'Which city is the capital of France?',
        'subject': 'Geography',
        'difficulty': 'Easy'
    },
    {
        '_id': '4',
        'questionText': 'What is the capital of Italy?',
        'subject': 'Geography',
        'difficulty': 'Easy'
    }
]

# ===================================
# FIND DUPLICATE QUESTIONS
# ===================================

@duplicates_bp.route('', methods=['POST'])
def find_duplicates():
    """
    Find duplicate questions in database
    """
    try:
        data = request.get_json()
        threshold = float(data.get('threshold', 0.8))

        duplicates_list = []
        seen = set()

        # Compare each question with others
        for i, q1 in enumerate(QUESTIONS_DATABASE):
            for j, q2 in enumerate(QUESTIONS_DATABASE[i+1:], i+1):
                if q1['_id'] in seen or q2['_id'] in seen:
                    continue

                similarity = compute_similarity(q1['questionText'], q2['questionText'])

                if similarity >= threshold:
                    duplicates_list.append({
                        'original': {
                            '_id': q1['_id'],
                            'text': q1['questionText']
                        },
                        'duplicate': {
                            '_id': q2['_id'],
                            'text': q2['questionText']
                        },
                        'similarity': float(similarity),
                        'action': 'review'
                    })
                    seen.add(q2['_id'])

        return jsonify({
            'success': True,
            'data': {
                'duplicates': duplicates_list,
                'count': len(duplicates_list),
                'totalQuestions': len(QUESTIONS_DATABASE),
                'duplicatePercentage': float((len(duplicates_list) / len(QUESTIONS_DATABASE)) * 100) if QUESTIONS_DATABASE else 0
            }
        }), 200

    except Exception as e:
        logger.error(f"Error finding duplicates: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error finding duplicates',
            'error': str(e)
        }), 500

# ===================================
# FIND DUPLICATES FOR SINGLE QUESTION
# ===================================

@duplicates_bp.route('/for-question', methods=['POST'])
def find_duplicates_for_question():
    """
    Find duplicates for a specific question
    """
    try:
        data = request.get_json()
        question_id = data.get('questionId')
        threshold = float(data.get('threshold', 0.8))

        if not question_id:
            return jsonify({
                'success': False,
                'message': 'Question ID is required'
            }), 400

        # Find the question
        question = None
        for q in QUESTIONS_DATABASE:
            if q['_id'] == question_id:
                question = q
                break

        if not question:
            return jsonify({
                'success': False,
                'message': 'Question not found'
            }), 404

        # Find similar questions
        duplicates = []
        for q in QUESTIONS_DATABASE:
            if q['_id'] != question_id:
                similarity = compute_similarity(question['questionText'], q['questionText'])
                if similarity >= threshold:
                    duplicates.append({
                        '_id': q['_id'],
                        'text': q['questionText'],
                        'subject': q.get('subject'),
                        'difficulty': q.get('difficulty'),
                        'similarity': float(similarity)
                    })

        # Sort by similarity descending
        duplicates.sort(key=lambda x: x['similarity'], reverse=True)

        return jsonify({
            'success': True,
            'data': {
                'originalQuestion': {
                    '_id': question['_id'],
                    'text': question['questionText']
                },
                'duplicates': duplicates,
                'count': len(duplicates)
            }
        }), 200

    except Exception as e:
        logger.error(f"Error finding duplicates for question: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error finding duplicates',
            'error': str(e)
        }), 500

# ===================================
# CHECK DUPLICATE PAIR
# ===================================

@duplicates_bp.route('/check-pair', methods=['POST'])
def check_duplicate_pair():
    """
    Check if two questions are duplicates
    """
    try:
        data = request.get_json()
        question1_id = data.get('question1Id')
        question2_id = data.get('question2Id')
        threshold = float(data.get('threshold', 0.8))

        if not question1_id or not question2_id:
            return jsonify({
                'success': False,
                'message': 'Both question IDs are required'
            }), 400

        # Find questions
        q1 = None
        q2 = None

        for q in QUESTIONS_DATABASE:
            if q['_id'] == question1_id:
                q1 = q
            elif q['_id'] == question2_id:
                q2 = q

        if not q1 or not q2:
            return jsonify({
                'success': False,
                'message': 'One or both questions not found'
            }), 404

        # Compute similarity
        similarity = compute_similarity(q1['questionText'], q2['questionText'])
        is_duplicate = similarity >= threshold

        return jsonify({
            'success': True,
            'data': {
                'question1': {'_id': q1['_id'], 'text': q1['questionText']},
                'question2': {'_id': q2['_id'], 'text': q2['questionText']},
                'similarity': float(similarity),
                'isDuplicate': is_duplicate,
                'recommendation': 'merge' if is_duplicate else 'keep separate'
            }
        }), 200

    except Exception as e:
        logger.error(f"Error checking duplicate pair: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error checking duplicates',
            'error': str(e)
        }), 500
