# ===================================
# ROUTES/ANALYZE.PY - Question Analysis Route
# ===================================

from flask import Blueprint, request, jsonify
import logging
from utils.nlp import (
    preprocess_text, extract_keywords, analyze_text_complexity,
    detect_question_type, calculate_quality_score
)

logger = logging.getLogger(__name__)

analyze_bp = Blueprint('analyze', __name__, url_prefix='/analyze')

# ===================================
# ANALYZE QUESTION
# ===================================

@analyze_bp.route('', methods=['POST'])
def analyze_question():
    """
    Analyze a question and return AI suggestions
    """
    try:
        data = request.get_json()
        question = data.get('question', '').strip()

        if not question:
            return jsonify({
                'success': False,
                'message': 'Question text is required'
            }), 400

        # Preprocess
        processed = preprocess_text(question)

        # Extract analysis
        keywords = extract_keywords(question, num_keywords=5)
        complexity = analyze_text_complexity(question)
        question_type = detect_question_type(question)
        quality = calculate_quality_score(question)

        # Determine difficulty based on complexity
        if complexity.get('avg_word_length', 0) > 7 and complexity.get('total_words', 0) > 50:
            difficulty = 'Hard'
        elif complexity.get('avg_word_length', 0) > 5 and complexity.get('total_words', 0) > 25:
            difficulty = 'Medium'
        else:
            difficulty = 'Easy'

        # Determine Bloom level based on keywords
        create_keywords = ['design', 'create', 'develop', 'hypothesize', 'propose']
        evaluate_keywords = ['justify', 'critique', 'judge', 'evaluate', 'argue']
        analyze_keywords = ['analyze', 'compare', 'contrast', 'distinguish', 'categorize']
        apply_keywords = ['apply', 'solve', 'demonstrate', 'use', 'calculate']
        understand_keywords = ['explain', 'describe', 'summarize', 'discuss', 'identify']

        text_lower = question.lower()
        if any(kw in text_lower for kw in create_keywords):
            bloom_level = 'Create'
        elif any(kw in text_lower for kw in evaluate_keywords):
            bloom_level = 'Evaluate'
        elif any(kw in text_lower for kw in analyze_keywords):
            bloom_level = 'Analyze'
        elif any(kw in text_lower for kw in apply_keywords):
            bloom_level = 'Apply'
        elif any(kw in text_lower for kw in understand_keywords):
            bloom_level = 'Understand'
        else:
            bloom_level = 'Remember'

        # Subject detection (placeholder - would use ML model in production)
        subject = detect_subject(question)

        return jsonify({
            'success': True,
            'data': {
                'subject': subject,
                'difficulty': difficulty,
                'bloomLevel': bloom_level,
                'questionType': question_type,
                'tags': keywords,
                'complexity': complexity,
                'quality': quality
            }
        }), 200

    except Exception as e:
        logger.error(f"Error analyzing question: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error analyzing question',
            'error': str(e)
        }), 500

# ===================================
# HELPER FUNCTIONS
# ===================================

def detect_subject(question):
    """
    Detect subject based on keywords (simplified version)
    """
    subjects_keywords = {
        'Mathematics': ['equation', 'calculate', 'solve', 'function', 'integral', 'derivative', 'algebra', 'geometry'],
        'Science': ['atom', 'molecule', 'reaction', 'energy', 'force', 'physics', 'chemistry', 'biology'],
        'History': ['war', 'emperor', 'revolution', 'century', 'king', 'civilization', 'historical'],
        'Literature': ['novel', 'poem', 'author', 'character', 'plot', 'theme', 'metaphor'],
        'Geography': ['country', 'capital', 'continent', 'ocean', 'mountain', 'climate', 'population'],
        'Economics': ['market', 'supply', 'demand', 'inflation', 'gdp', 'trade', 'economy'],
        'Computer Science': ['algorithm', 'code', 'program', 'database', 'network', 'software', 'data structure']
    }

    text_lower = question.lower()
    scores = {}

    for subject, keywords in subjects_keywords.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[subject] = score

    if scores:
        return max(scores, key=scores.get)
    else:
        return 'General'
