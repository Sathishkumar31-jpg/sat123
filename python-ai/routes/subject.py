# ===================================
# ROUTES/SUBJECT.PY - Subject Classification Route
# ===================================

from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)

subject_bp = Blueprint('subject', __name__, url_prefix='/subject')

# Subject keywords for classification
SUBJECT_KEYWORDS = {
    'Mathematics': [
        'equation', 'calculate', 'solve', 'function', 'integral', 'derivative',
        'algebra', 'geometry', 'trigonometry', 'matrix', 'variable', 'polynomial',
        'quadratic', 'linear', 'calculus', 'number', 'sum', 'product', 'theorem'
    ],
    'Science': [
        'atom', 'molecule', 'reaction', 'energy', 'force', 'physics', 'chemistry',
        'biology', 'element', 'compound', 'cell', 'organism', 'ecosystem', 'matter',
        'velocity', 'acceleration', 'pressure', 'temperature', 'dna'
    ],
    'History': [
        'war', 'emperor', 'revolution', 'century', 'king', 'civilization', 'historical',
        'ancient', 'medieval', 'modern', 'dynasty', 'treaty', 'nation', 'empire',
        'colonial', 'independence', 'government', 'political'
    ],
    'Literature': [
        'novel', 'poem', 'author', 'character', 'plot', 'theme', 'metaphor', 'story',
        'fiction', 'narrative', 'dialogue', 'protagonist', 'antagonist', 'setting',
        'conflict', 'resolution', 'symbolism', 'literary'
    ],
    'Geography': [
        'country', 'capital', 'continent', 'ocean', 'mountain', 'climate', 'population',
        'latitude', 'longitude', 'terrain', 'region', 'boundary', 'border', 'map',
        'landscape', 'vegetation', 'agriculture', 'trade'
    ],
    'Economics': [
        'market', 'supply', 'demand', 'inflation', 'gdp', 'trade', 'economy', 'profit',
        'loss', 'investment', 'currency', 'stock', 'bank', 'commerce', 'business',
        'consumer', 'producer', 'price'
    ],
    'Computer Science': [
        'algorithm', 'code', 'program', 'database', 'network', 'software', 'data structure',
        'variable', 'function', 'class', 'object', 'inheritance', 'polymorphism', 'api',
        'framework', 'library', 'compiler', 'debug'
    ],
    'Physics': [
        'force', 'motion', 'energy', 'wave', 'light', 'sound', 'electricity', 'magnetism',
        'gravity', 'velocity', 'acceleration', 'momentum', 'kinetic', 'potential',
        'quantum', 'mechanics', 'thermodynamics'
    ],
    'Chemistry': [
        'element', 'compound', 'reaction', 'bonding', 'acid', 'base', 'salt', 'oxidation',
        'reduction', 'ion', 'atom', 'molecule', 'equilibrium', 'concentration',
        'organic', 'inorganic', 'catalyst'
    ],
    'Biology': [
        'cell', 'organism', 'dna', 'protein', 'enzyme', 'photosynthesis', 'respiration',
        'reproduction', 'evolution', 'genetics', 'mutation', 'natural selection',
        'ecosystem', 'food chain', 'adaptation'
    ]
}

# ===================================
# PREDICT SUBJECT
# ===================================

@subject_bp.route('', methods=['POST'])
def predict_subject():
    """
    Predict question subject/domain
    """
    try:
        data = request.get_json()
        question = data.get('question', '').strip()

        if not question:
            return jsonify({
                'success': False,
                'message': 'Question text is required'
            }), 400

        # Convert to lowercase for matching
        text_lower = question.lower()

        # Calculate scores for each subject
        scores = {}
        for subject, keywords in SUBJECT_KEYWORDS.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
            if score > 0:
                scores[subject] = score

        if not scores:
            predicted = 'General'
            confidence = 0.3
        else:
            # Get top prediction
            predicted = max(scores, key=scores.get)
            max_score = scores[predicted]
            total_keywords = sum(len(kw_list) for kw_list in SUBJECT_KEYWORDS.values())
            confidence = min(0.95, (max_score / max(len(SUBJECT_KEYWORDS[predicted]), 5)) * 0.9)

        # Get alternative predictions
        alternatives = []
        for subject in sorted(scores.keys(), key=lambda x: scores[x], reverse=True)[1:4]:
            alternatives.append({
                'subject': subject,
                'score': scores[subject]
            })

        return jsonify({
            'success': True,
            'data': {
                'subject': predicted,
                'confidence': float(confidence),
                'alternatives': alternatives,
                'all_scores': scores
            }
        }), 200

    except Exception as e:
        logger.error(f"Error predicting subject: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error predicting subject',
            'error': str(e)
        }), 500
