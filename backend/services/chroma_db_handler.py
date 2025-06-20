import chromadb
import uuid
import json
import os
from typing import List, Dict, Optional
from config import AppConfig

class ChromaDBHandler:
    def __init__(self, config_data: AppConfig):
        self.config = config_data
        self.client = chromadb.PersistentClient(path=self.get_path(self.config.chroma_path))

    def get_or_create_collection(self, collection_name: str) -> chromadb.Collection:
        collection = self.client.get_or_create_collection(name=collection_name)
        return collection

    def get_path(self, relative_path: str) -> str:
        base_path = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(base_path, relative_path)

    def load_config(self, config_path: str) -> dict:
        with open(config_path, 'r') as config_file:
            return json.load(config_file)

    def upsert_documents(self, collection: chromadb.Collection, documents: list):
        """Original method for backward compatibility"""
        ids = [str(uuid.uuid4()) for _ in documents]
        collection.upsert(documents=documents, ids=ids)

    def upsert_documents_with_metadata(
            self,
            collection: chromadb.Collection,
            documents: List[str],
            metadatas: Optional[List[Dict]] = None,
            ids: Optional[List[str]] = None
    ):
        """Enhanced method that supports metadata and custom IDs"""
        if not documents:
            return

        # Generate IDs if not provided
        if not ids:
            ids = [str(uuid.uuid4()) for _ in documents]

        # Create empty metadata if not provided
        if not metadatas:
            metadatas = [{"source": "unknown"} for _ in documents]

        # Ensure all lists have the same length
        min_length = min(len(documents), len(metadatas), len(ids))
        documents = documents[:min_length]
        metadatas = metadatas[:min_length]
        ids = ids[:min_length]

        # Batch upsert to avoid memory issues with large datasets
        batch_size = 1000
        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i:i + batch_size]
            batch_meta = metadatas[i:i + batch_size]
            batch_ids = ids[i:i + batch_size]

            collection.upsert(
                documents=batch_docs,
                metadatas=batch_meta,
                ids=batch_ids
            )

        print(f"Upserted {len(documents)} documents to collection")

    def query_documents(self, collection: chromadb.Collection, query_text: str, n_results: int) -> chromadb.QueryResult:
        """Query documents with support for both string and list query_texts"""
        if isinstance(query_text, str):
            query_texts = [query_text]
        else:
            query_texts = query_text

        return collection.query(
            query_texts=query_texts,
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )

    def query_documents_with_filter(
            self,
            collection: chromadb.Collection,
            query_text: str,
            n_results: int,
            where_filter: Optional[Dict] = None
    ) -> chromadb.QueryResult:
        """Query documents with metadata filtering"""
        if isinstance(query_text, str):
            query_texts = [query_text]
        else:
            query_texts = query_text

        query_params = {
            "query_texts": query_texts,
            "n_results": n_results,
            "include": ["documents", "metadatas", "distances"]
        }

        if where_filter:
            query_params["where"] = where_filter

        return collection.query(**query_params)

    def peek_collection(self, collection: chromadb.Collection) -> chromadb.GetResult:
        return collection.peek()

    def get_collection_stats(self, collection: chromadb.Collection) -> Dict:
        """Get statistics about the collection"""
        try:
            count = collection.count()
            peek_result = collection.peek(limit=5)

            # Analyze metadata to get document types
            doc_types = {}
            law_numbers = set()

            if peek_result.get('metadatas'):
                for meta in peek_result['metadatas']:
                    if meta:
                        doc_type = meta.get('chunk_type', meta.get('type', 'unknown'))
                        doc_types[doc_type] = doc_types.get(doc_type, 0) + 1

                        if meta.get('law_number'):
                            law_numbers.add(meta['law_number'])

            return {
                'total_documents': count,
                'document_types': doc_types,
                'unique_laws': len(law_numbers),
                'sample_law_numbers': list(law_numbers)[:5]
            }
        except Exception as e:
            return {'error': str(e)}

    def delete_collection(self, collection_name: str):
        """Delete a collection"""
        try:
            self.client.delete_collection(name=collection_name)
            print(f"Deleted collection: {collection_name}")
        except Exception as e:
            print(f"Error deleting collection {collection_name}: {e}")

    def list_collections(self) -> List[str]:
        """List all collections"""
        try:
            collections = self.client.list_collections()
            return [col.name for col in collections]
        except Exception as e:
            print(f"Error listing collections: {e}")
            return []