import chromadb
from chromadb.config import Settings
import uuid

# Initialize the ChromaDB client
client = chromadb.HttpClient(host="localhost", port=8000)
store = client.get_or_create_collection(name="chapter_versions")


# // saving the retrieval text
def save(text: str, v_id: str = None) -> str:
    """
    Save a text version to ChromaDB. If version_id is not given, generate a new one.
    """
    u_id = v_id or str(uuid.uuid4())

    store.add(
        documents=[text],
        ids=[u_id],
        metadatas=[{"version": u_id}]
    )

    print(f"[ChromaDB] Version saved: {u_id}")
    return u_id

# getting / retrieve data 
def retrieve(query: str, n_results: int = 3):
    """
    Retrieve similar entries from the collection based on query.
    """
    try:
        matches = store.query(
            query_texts=[query],
            n_results=n_results
        )

        docs = matches.get("documents", [[]])[0]
        ids = matches.get("ids", [[]])[0]

        # Combine IDs and docs into a more usable structure
        return [
            {"version_id": ids[i], "text": docs[i]}
            for i in range(len(ids))
        ]
    except Exception as e:
        print(f"[ChromaDB] Error :{e}")
        return []
