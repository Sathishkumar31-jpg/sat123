# ===================================
# UTILS/NLP.PY - NLP Utilities
# ===================================

import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# ===================================
# PREPROCESSING
# ===================================

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    """
    Preprocess text for analysis
    """
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and lemmatize
    tokens = [lemmatizer.lemmatize(token) for token in tokens 
              if token.isalnum() and token not in stop_words]
    
    return ' '.join(tokens)

def extract_keywords(text, num_keywords=10):
    """
    Extract keywords from text using TF-IDF
    """
    try:
        vectorizer = TfidfVectorizer(max_features=num_keywords)
        vectorizer.fit_transform([text])
        keywords = vectorizer.get_feature_names_out()
        return list(keywords)
    except Exception as e:
        logger.error(f"Error extracting keywords: {str(e)}")
        return []

# ===================================
# SIMILARITY COMPUTATION
# ===================================

def compute_similarity(text1, text2):
    """
    Compute semantic similarity between two texts using TF-IDF and cosine similarity
    """
    try:
        if not text1 or not text2:
            return 0.0
        
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        return float(similarity)
    except Exception as e:
        logger.error(f"Error computing similarity: {str(e)}")
        return 0.0

def find_similar_questions(question, questions_list, threshold=0.7, max_results=10):
    """
    Find similar questions from a list
    """
    try:
        similarities = []
        
        for q in questions_list:
            sim = compute_similarity(question, q.get('questionText', ''))
            if sim >= threshold:
                similarities.append({
                    'question': q,
                    'similarity': sim
                })
        
        # Sort by similarity descending
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        
        return similarities[:max_results]
    except Exception as e:
        logger.error(f"Error finding similar questions: {str(e)}")
        return []

# ===================================
# TEXT ANALYSIS
# ===================================

def analyze_text_complexity(text):
    """
    Analyze text complexity metrics
    """
    try:
        tokens = word_tokenize(text)
        sentences = sent_tokenize(text)
        
        avg_word_length = np.mean([len(token) for token in tokens]) if tokens else 0
        avg_words_per_sentence = len(tokens) / len(sentences) if sentences else 0
        unique_words = len(set(tokens))
        total_words = len(tokens)
        
        return {
            'avg_word_length': float(avg_word_length),
            'avg_words_per_sentence': float(avg_words_per_sentence),
            'unique_word_ratio': float(unique_words / total_words) if total_words > 0 else 0,
            'total_words': total_words,
            'total_sentences': len(sentences)
        }
    except Exception as e:
        logger.error(f"Error analyzing text complexity: {str(e)}")
        return {}

def detect_question_type(text):
    """
    Detect question type based on keywords
    """
    try:
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['true', 'false']):
            return 'True/False'
        elif any(word in text_lower for word in ['which', 'select', 'choose']):
            return 'Multiple Choice'
        elif any(word in text_lower for word in ['short', 'briefly', 'describe']):
            return 'Short Answer'
        elif any(word in text_lower for word in ['explain', 'discuss', 'analyze']):
            return 'Essay'
        else:
            return 'Multiple Choice'  # Default
    except Exception as e:
        logger.error(f"Error detecting question type: {str(e)}")
        return 'Multiple Choice'

# ===================================
# SCORING AND EVALUATION
# ===================================

def calculate_quality_score(text):
    """
    Calculate quality metrics for question
    """
    try:
        metrics = analyze_text_complexity(text)
        
        # Calculate individual scores (0-100)
        clarity = min(100, (metrics.get('avg_word_length', 0) * 10))  # Penalize very long words
        relevance = min(100, (metrics.get('unique_word_ratio', 0) * 100))  # More unique words = better
        depth = min(100, (metrics.get('total_words', 0) / 50 * 100))  # Word count indicates depth
        
        return {
            'clarity': float(clarity),
            'relevance': float(relevance),
            'depth': float(depth),
            'overall': float((clarity + relevance + depth) / 3)
        }
    except Exception as e:
        logger.error(f"Error calculating quality score: {str(e)}")
        return {}
