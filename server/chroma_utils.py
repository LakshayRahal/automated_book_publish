import chromadb

# // using relative dabs 
from chromadb.config import Settings
import uuid

# Initialize the ChromaDB client
clt =chromadb.HttpClient(host="localhost", port=8001)
# making a new collection if not exist 
sto = clt.get_or_create_collection(name="chapter_versions")


# // saving the retrieval text
def savdata(tt: str, v_id: str = None) -> str:
    """
    Save a text version to ChromaDB. If version_id is not given, generate a new one.
    """
    u_id = v_id or str(uuid.uuid4())
    # adding versions to cdb
    sto.add(
        documents=[tt],
        ids=[u_id],
        metadatas=[{"version": u_id}]
    )

    print(f"[ChromaDB] Version saved: {u_id}")
    return u_id

# getting / retrieve data 
def retrieve(quer: str, rs: int = 3):
    """
    Retrieve similar entries from the collection based on query.
    """
    try:
        matches = sto.query(
            query_texts=[quer],
            n_results=rs
        )

        ds = matches.get("documents", [[]])[0]
        ids = matches.get("ids", [[]])[0]

        # Combine IDs and docs into a more usable structure
        return [
            {"version_id": ids[i], "text": ds[i]}
            for i in range(len(ids))
        ]
    except Exception as e:
        print(f"[ChromaDB] Error :{e}")
        return [] 