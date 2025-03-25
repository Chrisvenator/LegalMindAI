# LegalMind AI - Intelligent Legal Assistant

LegalMind AI is a powerful web-based legal assistant that leverages vector databases, large language models, and a modern React frontend to provide accurate, contextual legal analysis and advice.

## Overview

LegalMind AI creates a searchable knowledge base from your legal documents and uses advanced AI to generate precise legal insights. The system consists of:
- A Flask backend that processes legal documents
- A ChromaDB vector database for semantic search
- A React frontend for intuitive user interaction
- DeepSeek language model for intelligent analysis

## Key Features

- **Custom Knowledge Base**: Import and process your own legal text documents
- **Semantic Search**: Find relevant legal information using natural language queries
- **AI-Powered Analysis**: Generate detailed legal insights with proper terminology
- **Modern Web Interface**: Clean, responsive React-based chat application
- **Cross-Platform Compatibility**: Runs on multiple operating systems

## System Requirements

- Python 3.10+
- Node.js and npm
- Ollama
- ChromaDB

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/legalmind-ai.git
   cd legalmind-ai
   ```

2. Install Ollama and the DeepSeek model:
   ```bash
   ollama pull deepseek-r1:8b
   ```

3. Create a virtual environment and install dependencies:

   Windows:
   ```shell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

   Linux/macOS:
   ```shell
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

### Configuration

1. Create a `resources` directory in the project root:
   ```bash
   mkdir resources
   ```

2. Create a `config.json` file in the `resources` directory:
   ```json
   {
       "chroma_path": "../chroma_db",
       "chroma_collection_name": "legal_docs"
   }
   ```

3. Place your legal text files (.txt) in the `resources` directory

## Running the Application

### Startup

1. Start the backend:
   ```bash
   python flask_backend.py
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```

### Setting up the Knowledge Base

To create and populate the ChromaDB:

```bash
python main.py setup
```

## Usage

1. Open `http://localhost:3000` in your web browser
2. Enter legal questions in the chat interface
3. Receive AI-generated legal insights based on your document collection

## Project Structure

```
legalmind-ai/
├── backend/
│   ├── app.py                 # Core application logic
│   ├── config.py              # Configuration handling
│   ├── main.py                # Entry point
│   ├── flask_backend.py       # Flask API server
│   └── services/
│       └── chroma_db_handler.py  # Vector database interactions
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   └── UserInterface.jsx  # Main chat interface
│   │   └── services/
│   │       └── apiService.js      # API communication
│   └── tailwind.config.js     # Tailwind CSS configuration
├── resources/
│   ├── config.json            # Configuration settings
│   └── *.txt                  # Your legal documents
└── chroma_db/                 # Vector database storage (created automatically)
```

## Limitations

- Response quality depends on the legal documents you provide
- Not a substitute for professional legal advice
- Performance varies based on question complexity

## Technologies Used

- Backend: Python, Flask, ChromaDB
- Frontend: React, Tailwind CSS
- AI Model: DeepSeek
- Database: ChromaDB

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please submit a Pull Request.

## Support

For issues or questions, please open a GitHub issue in the repository.