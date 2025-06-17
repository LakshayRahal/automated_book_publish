import chromadb
from chromadb.config import Settings
import uuid

client = chromadb.HttpClient(host="localhost", port=8000)
collection = client.get_or_create_collection(name="chapter_versions")

def save_version(text: str, version_id: str = None):
    version_id = version_id or str(uuid.uuid4())
    collection.add(
        documents=[text],
        ids=[version_id],
        metadatas=[{"version": version_id}]
    )
    print(f"[ChromaDB] ✅ Saved version '{version_id}'")
    return version_id

def retrieve_similar_version(query: str, n_results: int = 3):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    docs = results.get("documents", [[]])[0]
    ids = results.get("ids", [[]])[0]
    return [
        {"version_id": ids[i], "text": docs[i]}
        for i in range(len(ids))
    ]
