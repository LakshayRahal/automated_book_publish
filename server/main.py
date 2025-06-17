from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from reward_engine import record_feedback, get_cumulative_rewards
from scraper import scrape_chapter
from ai_agents import spin_text, review_text
from chroma_utils import save_version, retrieve_similar_version

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    url: str

class TextRequest(BaseModel):
    text: str
    version_id: Optional[str] = None

class RetrieveRequest(BaseModel):
    query: str

class FeedbackRequest(BaseModel):
    version_id: str
    feedback: str

@app.get("/")
def root():
    return {"message": "API is running"}

@app.post("/scrape")
def scrape(request: ScrapeRequest):
    try:
        print(f"[+] Scraping: {request.url}")
        text, screenshot_path = scrape_chapter(request.url)
        return {"content": text, "screenshot": screenshot_path}
    except Exception as e:
        print(f"[ERROR] Scraping failed: {e}")
        return {"error": str(e)}

@app.post("/spin")
def spin(request: TextRequest):
    result = spin_text(request.text)
    version_id = save_version(result)
    return {"spun_text": result, "version_id": version_id}

@app.post("/review")
def review(request: TextRequest):
    result = review_text(request.text)
    return {"reviewed_text": result}

@app.post("/save_version")
def save(request: TextRequest):
    version_id = request.version_id or "v1"
    save_version(request.text, version_id)
    return {"message": f"Version {version_id} saved successfully."}

@app.post("/retrieve")
def retrieve(request: RetrieveRequest):
    result = retrieve_similar_version(request.query)
    return {"results": result}

@app.post("/feedback")
def collect_feedback(request: FeedbackRequest):
    reward = record_feedback(request.version_id, request.feedback)
    return {"message": "Feedback recorded", "reward": reward}

@app.post("/ranked_results")
def get_ranked_results(request: RetrieveRequest):
    similar_versions = retrieve_similar_version(request.query)
    rewards = get_cumulative_rewards()
    sorted_versions = sorted(
        similar_versions,
        key=lambda r: rewards.get(r["version_id"], 0),
        reverse=True
    )
    return {"results": sorted_versions}
