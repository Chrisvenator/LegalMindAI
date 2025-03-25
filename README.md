# LegalMind AI - Intelligent Legal Assistant

LegalMind AI is a powerful legal assistant that leverages vector databases and large language models to provide accurate, contextual legal analysis and advice based on your own legal documents.

## Overview

LegalMind AI creates a searchable knowledge base from your legal documents and uses advanced AI to generate precise legal insights. The system processes text files containing legal information, stores them in a vector database (ChromaDB), and retrieves relevant context to answer legal questions using the DeepSeek language model.

## Features

- **Custom Knowledge Base**: Import and process your own legal text documents
- **Semantic Search**: Find relevant legal information using natural language queries
- **AI-Powered Analysis**: Generate detailed legal analysis with proper terminology and citations
- **Methodical Approach**: Systematically examines legal questions with consideration of statutes, case law, and legal principles
- **Easy Setup**: Simple configuration and straightforward usage

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/legalmind-ai.git
   cd legalmind-ai
   ```

2. Install [Ollama](https://ollama.ai/) and the DeepSeek model:
   ```bash
   ollama pull deepseek-r1:8b
   ```

3. Create a `resources` directory and place your config.json file:
   ```bash
   mkdir resources
   ```

4. Create a config.json file in the resources directory:
   ```json
   {
       "chroma_path": "../chroma_db",
       "chroma_collection_name": "legal_docs"
   }
   ```

5. Create a new venv enviroment, activate it and install all dependencies from the requirements.txt:

Windows: 
```shell
python -m venv envname
.\envname\Scripts\activate
pip install -r requirements.txt
```

Linux:
```shell
python -m venv envname
source envname/bin/activate
pip install -r requirements.txt
```


6. Put law .txt Files into Resources
## Usage

### Setting up the Knowledge Base

Place your legal text files (.txt) in the `resources` directory, then run:

```bash
python main.py setup
```

Running the program in setup mode will create and populate a local chroma db inside a folder named **chroma**.

### Asking Legal Questions

To query the system with legal questions:

```bash
python main.py question
```
Running the program in question mode will prompt a user to ask a question.
For best result enter a question that can be answered with the data stored in the chroma database. 
When prompted with your legal question, the system will:
1. Find relevant information from your legal documents
2. Generate a detailed legal analysis using the LLM
3. Present the answer with proper legal terminology and considerations

## Project Structure

```
legalmind-ai/
├── app.py                    # Core application logic
├── config.py                 # Configuration handling
├── main.py                   # Entry point
├── services/
│   └── chroma_db_handler.py  # Vector database interactions
├── resources/                # Legal text files and configuration
│   ├── config.json           # Configuration settings
│   └── *.txt                 # Your legal documents
└── chroma_db/                # Vector database storage (created automatically)
```

## Requirements

- Python 3.10+
- ChromaDB
- Ollama with DeepSeek model
- BeautifulSoup4 (for HTML parsing if needed)

## Limitations

- The quality of responses depends on the legal documents you provide
- This is not a substitute for professional legal advice
- Performance may vary based on the complexity of legal questions and available context

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.