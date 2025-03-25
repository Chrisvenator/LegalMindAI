from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import logging

# Ensure the project root is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import Application
from services.chroma_db_handler import ChromaDBHandler
from config import load_config

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)-8s %(message)s',
    handlers=[
        logging.FileHandler('flask_server.log'),
        logging.StreamHandler()
    ]
)

# Initialize the application
config_data = load_config("./resources/config.json")
chroma_db_handler = ChromaDBHandler(config_data)
legal_app = Application(config_data, chroma_db_handler)

# Ensure the database is set up
legal_app.runSetup()

@app.route('/api/ask-legal-question', methods=['POST'])
def ask_legal_question():
    try:
        # Get the question from the request
        data = request.json
        question = data.get('question', '')

        if not question:
            return jsonify({
                'error': 'No question provided',
                'answer': 'Please ask a specific legal question.'
            }), 400

        # Use the existing application method to get an answer
        answer = legal_app.runQuestion(question)

        return jsonify({
            'question': question,
            'answer': answer
        })

    except Exception as e:
        logging.error(f"Error processing question: {str(e)}")
        return jsonify({
            'error': 'An error occurred while processing your question',
            'answer': 'Sorry, I encountered an error. Please try again.'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)