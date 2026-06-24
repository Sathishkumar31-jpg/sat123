# ===================================
# ROUTES/AUTOTAG.PY - Auto-Tagging Route
# ===================================

from flask import Blueprint, request, jsonify
import logging
from utils.nlp import extract_keywords

logger = logging.getLogger(__name__)

autotag_bp = Blueprint('autotag', __name__, url_prefix='/autotag')

# Common tags by domain
DOMAIN_TAGS = {
    'Mathematics': ['algebra', 'geometry', 'calculus', 'linear', 'statistics'],
    'Science': ['physics', 'chemistry', 'biology', 'energy', 'matter'],
    'History': ['ancient', 'medieval', 'modern', 'political', 'cultural'],
    'Literature': ['poetry', 'prose', 'drama', 'narrative', 'symbolism'],
    'Geography': ['physical', 'human', 'political', 'economic', 'cultural'],
    'Economics': ['microeconomics', 'macroeconomics', 'international', 'development'],
    'Computer Science': ['algorithms', 'data structures', 'networking', 'databases', 'ai']
}

# ===================================
# AUTO-TAG SINGLE QUESTION
# ===================================

@autotag_bp.route('/single', methods=['POST'])
def autotag_single():
    """
    Auto-tag a single question
    """
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        subject = data.get('subject', '').strip()

        if not question:
            return jsonify({
                'success': False,
                'message': 'Question text is required'
            }), 400

        # Extract keywords
        keywords = extract_keywords(question, num_keywords=8)

        # Get domain-specific tags
        domain_tags = []
        if subject and subject in DOMAIN_TAGS:
            domain_tags = DOMAIN_TAGS[subject][:3]

        # Combine and deduplicate
        all_tags = list(set(keywords + domain_tags))

        return jsonify({
            'success': True,
            'data': {
                'tags': all_tags[:10],
                'auto_tags': keywords,
                'domain_tags': domain_tags
            }
        }), 200

    except Exception as e:
        logger.error(f"Error auto-tagging: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error auto-tagging',
            'error': str(e)
        }), 500

# ===================================
# AUTO-TAG BATCH QUESTIONS
# ===================================

@autotag_bp.route('/batch', methods=['POST'])
def autotag_batch():
    """
    Auto-tag multiple questions
    """
    try:
        data = request.get_json()
        questions = data.get('questions', [])

        if not isinstance(questions, list) or not questions:
            return jsonify({
                'success': False,
                'message': 'Questions array is required'
            }), 400

        results = []
        for q in questions:
            question_text = q.get('text', '').strip()
            subject = q.get('subject', '').strip()

            if not question_text:
                continue

            # Extract keywords
            keywords = extract_keywords(question_text, num_keywords=8)

            # Get domain-specific tags
            domain_tags = []
            if subject and subject in DOMAIN_TAGS:
                domain_tags = DOMAIN_TAGS[subject][:3]

            # Combine and deduplicate
            all_tags = list(set(keywords + domain_tags))

            results.append({
                'question_id': q.get('_id', q.get('id')),
                'tags': all_tags[:10],
                'auto_tags': keywords,
                'domain_tags': domain_tags
            })

        return jsonify({
            'success': True,
            'data': {
                'results': results,
                'count': len(results)
            }
        }), 200

    except Exception as e:
        logger.error(f"Error batch auto-tagging: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error batch auto-tagging',
            'error': str(e)
        }), 500

# ===================================
# SUGGEST TAGS
# ===================================

@autotag_bp.route('/suggestions', methods=['POST'])
def suggest_tags():
    """
    Suggest tags based on domain and keywords
    """
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        subject = data.get('subject', '').strip()
        num_tags = int(data.get('numTags', 5))

        if not question:
            return jsonify({
                'success': False,
                'message': 'Question text is required'
            }), 400

        # Extract keywords
        keywords = extract_keywords(question, num_keywords=num_tags)

        # Get domain-specific tags
        domain_tags = []
        if subject and subject in DOMAIN_TAGS:
            domain_tags = DOMAIN_TAGS[subject][:num_tags]

        # Combine with priority to extracted keywords
        suggestions = keywords + domain_tags
        suggestions = list(set(suggestions))[:num_tags]

        return jsonify({
            'success': True,
            'data': {
                'suggestions': suggestions,
                'count': len(suggestions)
            }
        }), 200

    except Exception as e:
        logger.error(f"Error suggesting tags: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error suggesting tags',
            'error': str(e)
        }), 500
