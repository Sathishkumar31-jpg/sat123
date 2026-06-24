"""
import_similarity.py

Command-line utility to import questions from a CSV and find similar questions

CSV expected columns (any of):
- question: the question text
- pdf: optional path to a PDF file to extract text from
- image: optional path to an image file to OCR

Outputs JSON with similarity results per row.
"""
import argparse
import json
import os
import pandas as pd
from utils.nlp import find_similar_questions, preprocess_text, extract_text_from_pdf, extract_text_from_image

# Basic mock question bank (can be replaced by providing --questions)
DEFAULT_QUESTIONS = [
    {
        '_id': '1',
        'questionText': 'What is the capital of France?',
        'subject': 'Geography',
        'difficulty': 'Easy',
        'options': []
    },
    {
        '_id': '2',
        'questionText': 'Name the capital of Italy?',
        'subject': 'Geography',
        'difficulty': 'Easy',
        'options': []
    }
]


def load_questions_from_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed to load questions file {path}: {e}")
        return DEFAULT_QUESTIONS


def aggregate_text(row):
    parts = []
    if 'question' in row and pd.notna(row['question']):
        parts.append(str(row['question']))

    if 'pdf' in row and pd.notna(row['pdf']):
        pdf_path = str(row['pdf'])
        if os.path.exists(pdf_path):
            parts.append(extract_text_from_pdf(pdf_path))
        else:
            print(f"PDF path not found: {pdf_path}")

    if 'image' in row and pd.notna(row['image']):
        img_path = str(row['image'])
        if os.path.exists(img_path):
            parts.append(extract_text_from_image(img_path))
        else:
            print(f"Image path not found: {img_path}")

    return '\n'.join([p for p in parts if p])


def main():
    parser = argparse.ArgumentParser(description='Import CSV and find similar questions')
    parser.add_argument('--csv', required=True, help='Path to input CSV')
    parser.add_argument('--questions', help='Path to questions JSON file (optional)')
    parser.add_argument('--threshold', type=float, default=0.7, help='Similarity threshold (0-1)')
    parser.add_argument('--max-results', type=int, default=5, help='Max similar results per row')
    parser.add_argument('--output', default='similarity_results.json', help='Output JSON file')

    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print('CSV file not found:', args.csv)
        return

    df = pd.read_csv(args.csv)

    questions_bank = DEFAULT_QUESTIONS
    if args.questions:
        questions_bank = load_questions_from_file(args.questions)

    results = []

    for idx, row in df.iterrows():
        text = aggregate_text(row)
        text = preprocess_text(text)

        if not text:
            results.append({'row': int(idx), 'success': False, 'message': 'No text found'})
            continue

        similar = find_similar_questions(text, questions_bank, threshold=args.threshold, max_results=args.max_results)
        formatted = [
            {
                '_id': s['question'].get('_id'),
                'questionText': s['question'].get('questionText'),
                'similarity': float(s['similarity'])
            }
            for s in similar
        ]

        results.append({'row': int(idx), 'success': True, 'input_text': text, 'matches': formatted})

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump({'results': results, 'count': len(results)}, f, indent=2, ensure_ascii=False)

    print('Wrote results to', args.output)


if __name__ == '__main__':
    main()
