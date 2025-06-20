import logging
import sys
import os
import json
from typing import List, Dict
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

    def _load_austrian_law_json(self, json_path: str) -> Dict:
        """Load Austrian law data from JSON file created by the scraper."""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                logging.info(f"Loaded Austrian law JSON with {len(data.get('documents', []))} documents")
                return data
        except Exception as e:
            logging.error(f"Error loading Austrian law JSON {json_path}: {e}")
            return {}

    def runSetup(self):
        """Initialize database by loading text files from resources directory and storing content in ChromaDB."""
        resources_dir = "./resources"

        # Load traditional text files
        text_files = [os.path.join(resources_dir, f) for f in os.listdir(resources_dir) if f.endswith('.txt')]

        # Check for Austrian law JSON file
        austrian_law_json = os.path.join(resources_dir, "austrian_laws_chromadb.json")

        if len(text_files) == 0 and not os.path.exists(austrian_law_json):
            print("No files found in " + resources_dir + ". Please put law documents in .txt format or Austrian law JSON file in there!")
            return

        logging.info(f"Starting to load {len(text_files)} text files and checking for Austrian law data...")

        vector_entries = []
        metadatas = []
        ids = []

        # Load traditional text files (your existing method)
        if text_files:
            with ThreadPoolExecutor(max_workers=min(10, len(text_files))) as executor:
                results = list(executor.map(self._load_text_file, text_files))
                for file_results in results:
                    vector_entries.extend(file_results)
                    # Add simple metadata for text files
                    metadatas.extend([{"source": "text_file", "type": "paragraph"} for _ in file_results])
                    ids.extend([f"txt_{i}" for i in range(len(ids), len(ids) + len(file_results))])

        # Load Austrian law JSON if it exists
        if os.path.exists(austrian_law_json):
            logging.info("Found Austrian law JSON file, loading structured law data...")
            austrian_data = self._load_austrian_law_json(austrian_law_json)

            if austrian_data:
                # Add Austrian law documents with rich metadata
                vector_entries.extend(austrian_data.get('documents', []))
                metadatas.extend(austrian_data.get('metadatas', []))
                ids.extend(austrian_data.get('ids', []))

                logging.info(f"Added {len(austrian_data.get('documents', []))} Austrian law documents")

        if not vector_entries:
            logging.error("No content was loaded from text files or Austrian law data. Exiting.")
            sys.exit(1)

        logging.info(f"Loaded {len(vector_entries)} total documents. Adding to ChromaDB...")
        self.collection = self.chroma_db_handler.get_or_create_collection(self.config.chroma_collection_name)

        # Use enhanced upsert method that handles metadata
        self.chroma_db_handler.upsert_documents_with_metadata(
            self.collection,
            vector_entries,
            metadatas,
            ids
        )

        logging.info("Setup completed successfully - ChromaDB is now populated with legal text content")

    def runQuestion(self, query_text: str) -> str:
        """Process a user question by querying the database and LLM."""
        if not self.collection:
            self.collection = self.chroma_db_handler.get_or_create_collection(self.config.chroma_collection_name)

        logging.info(f"Querying ChromaDB for: '{query_text[:50]}...' if len > 50")
        query_result = self.chroma_db_handler.query_documents(self.collection, query_text, n_results=5)

        # DIAGNOSTIC CODE
        # print("=== DEBUG INFO ===")
        # print(f"query_result type: {type(query_result)}")
        # print(f"query_result: {query_result}")
        # if query_result:
        #     print(f"Keys: {query_result.keys()}")
        #     for key, value in query_result.items():
        #         print(f"{key}: {type(value)} - {value}")
        # print("=== END DEBUG ===")

        if not query_result['documents'][0]:
            logging.warning("No relevant documents found for the query")
            return "I couldn't find relevant information to answer your question."

        context = '\n\n'.join(query_result['documents'][0])

        # Extract metadata for context - FIXED VERSION
        metadata_context = ""
        if query_result.get('metadatas') and query_result['metadatas'][0]:
            law_sources = []
            for meta in query_result['metadatas'][0]:
                # Check if meta is not None before calling .get()
                if meta is not None:
                    if meta.get('law_number'):
                        law_sources.append(f"Law {meta['law_number']} - {meta.get('title', '')}")
                    elif meta.get('url'):
                        law_sources.append(f"Source: {meta['url']}")

            if law_sources:
                metadata_context = f"\n\nSources: {'; '.join(set(law_sources))}"

        logging.info("Generating answer using LLM...")
        return self.get_answer_from_llm(context + metadata_context, query_text)

    def get_answer_from_llm(self, context: str, question: str) -> str:
        """Query the LLM with the given context and question."""
        llm_prompt = (
            "You are an AI Legal Counsel with expertise in Austrian law and all areas of law. "
            "You provide precise, accurate legal analysis and advice based on the information provided. "
            "\n\nAs legal counsel, you should:"
            "\n- Analyze legal questions methodically and thoroughly"
            "\n- Consider relevant statutes, case law, and legal principles from the provided context"
            "\n- Reference specific law numbers and sections when citing Austrian laws"
            "\n- Clearly distinguish between established legal facts and your professional opinion"
            "\n- Include appropriate disclaimers about not providing formal legal advice"
            "\n- Use proper legal terminology and citation formats when referencing legal sources"
            "\n- Identify potential legal risks and considerations"
            "\n- When citing Austrian laws, reference the specific BGBl numbers if available"
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