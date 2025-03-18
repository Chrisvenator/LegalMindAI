import logging
import sys
import os
from typing import List
from concurrent.futures import ThreadPoolExecutor

from ollama import chat
from config import AppConfig
from services.chroma_db_handler import ChromaDBHandler


class Application:
    def __init__(self, config: AppConfig, chroma_db_handler: ChromaDBHandler):
        self.config = config
        self.chroma_db_handler = chroma_db_handler
        self.collection = None

    def _load_text_file(self, file_path: str) -> List[str]:
        """Load content from a text file and return paragraphs as a list."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                # Split content into paragraphs
                paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
                logging.info(f"Loaded {len(paragraphs)} paragraphs from {file_path}")
                return paragraphs
        except Exception as e:
            logging.error(f"Error loading {file_path}: {e}")
            return []

    def runSetup(self):
        """Initialize database by loading text files from resources directory and storing content in ChromaDB."""
        resources_dir = "./resources"
        text_files = [os.path.join(resources_dir, f) for f in os.listdir(resources_dir) if f.endswith('.txt')]
        if len(text_files) == 0:
            print("No files found in " + resources_dir + ". Please put law documents in .txt format in there!")
            return

        logging.info(f"Starting to load {len(text_files)} text files...")

        # Use ThreadPoolExecutor for parallel loading
        vector_entries = []
        with ThreadPoolExecutor(max_workers=min(10, len(text_files))) as executor:
            results = list(executor.map(self._load_text_file, text_files))
            for file_results in results:
                vector_entries.extend(file_results)

        if not vector_entries:
            logging.error("No content was loaded from text files. Exiting.")
            sys.exit(1)

        logging.info(f"Loaded {len(vector_entries)} paragraphs. Adding to ChromaDB...")
        self.collection = self.chroma_db_handler.get_or_create_collection(self.config.chroma_collection_name)
        self.chroma_db_handler.upsert_documents(self.collection, vector_entries)

        logging.info("Setup completed successfully - ChromaDB is now populated with legal text content")

    def runQuestion(self, query_text: str) -> str:
        """Process a user question by querying the database and LLM."""
        if not self.collection:
            self.collection = self.chroma_db_handler.get_or_create_collection(self.config.chroma_collection_name)

        logging.info(f"Querying ChromaDB for: '{query_text[:50]}...' if len > 50")
        query_result = self.chroma_db_handler.query_documents(self.collection, query_text, n_results=5)

        if not query_result['documents'][0]:
            logging.warning("No relevant documents found for the query")
            return "I couldn't find relevant information to answer your question."

        context = '\n\n'.join(query_result['documents'][0])

        logging.info("Generating answer using LLM...")
        return self.get_answer_from_llm(context, query_text)

    def get_answer_from_llm(self, context: str, question: str) -> str:
        """Query the LLM with the given context and question."""
        llm_prompt = (
            "You are an AI Legal Counsel with expertise in all areas of law. "
            "You provide precise, accurate legal analysis and advice based on the information provided. "
            "\n\nAs legal counsel, you should:"
            "\n- Analyze legal questions methodically and thoroughly"
            "\n- Consider relevant statutes, case law, and legal principles from the provided context"
            "\n- Clearly distinguish between established legal facts and your professional opinion"
            "\n- Include appropriate disclaimers about not providing formal legal advice"
            "\n- Use proper legal terminology and citation formats when referencing legal sources"
            "\n- Identify potential legal risks and considerations"
            "\n\nQuestion: {question}"
            "\n\nRelevant Information: {context}"
            "\n\nProvide your analysis and advice:"
        ).format(question=question, context=context)

        response = chat(
            model='deepseek-r1:8b',
            messages=[{'role': 'user', 'content': llm_prompt}]
        )

        # Remove any thinking tokens if present
        import re
        cleaned_response = re.sub(r'<think>.*?</think>', '', response.message.content, flags=re.DOTALL)
        return cleaned_response.strip()