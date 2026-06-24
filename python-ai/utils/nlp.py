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
import io

# Optional libs for PDF/image text extraction
try:
    import PyPDF2
except Exception:
    PyPDF2 = None

try:
    from PIL import Image
    import pytesseract
except Exception:
    Image = None
    pytesseract = None

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

from nltk.stem import WordNetLemmatizer, PorterStemmer

# ===================================
# PREPROCESSING
# ===================================

lemmatizer = WordNetLemmatizer()
stemmer = PorterStemmer()
stop_words = set(stopwords.words('english'))
# Add common question words that aren't in stop_words but we don't want for similarity
stop_words.update(['what', 'which', 'who', 'how', 'why', 'whose', 'whom', 'where', 'when', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else'])

def preprocess_text(text):
    """
    Preprocess text for analysis: lowercase, tokenization, stopword removal, and stemming
    """
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and stem
    # We use stemming instead of lemmatization because it's better at matching word variations
    # (e.g., 'discovery' and 'discovered' both become 'discov')
    tokens = [stemmer.stem(token) for token in tokens 
              if token.isalnum() and token not in stop_words and len(token) > 1]
    
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
        
        # Preprocess both texts
        t1 = preprocess_text(text1)
        t2 = preprocess_text(text2)
        
        # If either is empty after preprocessing, similarity is 0 unless they were both empty
        if not t1 or not t2:
            # Fallback to raw comparison if preprocessing stripped everything (e.g. "What is?")
            if text1.strip().lower() == text2.strip().lower():
                return 1.0
            return 0.0
        
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([t1, t2])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        return float(similarity)
    except Exception as e:
        logger.error(f"Error computing similarity: {str(e)}")
        return 0.0

def find_similar_questions(question, questions_list, threshold=0.3, max_results=10):
    """
    Find similar questions from a list
    """
    try:
        similarities = []
        
        q_processed = preprocess_text(question)
        if not q_processed:
            q_processed = question.lower().strip()

        for q in questions_list:
            q_text = q.get('questionText', '')
            sim = compute_similarity(question, q_text)
            
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


# ===================================
# PDF / IMAGE TEXT EXTRACTION HELPERS
# ===================================

def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF file using PyPDF2 if available
    """
    try:
        if PyPDF2 is None:
            logger.warning('PyPDF2 not installed; cannot extract PDF text')
            return ''

        text_parts = []
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text() or ''
                text_parts.append(page_text)

        return '\n'.join(text_parts)
    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
        return ''


def extract_text_from_image(file_path):
    """
    Extract text from an image using pytesseract if available
    """
    try:
        if Image is None or pytesseract is None:
            logger.warning('Pillow or pytesseract not installed; cannot extract image text')
            return ''

        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image {file_path}: {str(e)}")
        return ''
