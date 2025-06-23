from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from reward_engine import rec_feedback, get_same_rewards
from scraper import scrap
from ai_agents import spin_content, aireview
from chroma_utils import save, retrieve

call_pi = FastAPI()

# cors all necessary conditions
call_pi.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Srequest(BaseModel):
    url: str

class Trequest(BaseModel):
    text: str
    version_id: Optional[str] = None

class Rrequest(BaseModel):
    query: str

class Frequest(BaseModel):
    version_id: str
    feedback: str


# main
@call_pi.get("/")
def root():
    return {"message": "API is running"}

# content from url 
@call_pi.post("/scrape")
def scrape(request: Srequest):
    try:
        print(f"[+] Scraping: {request.url}")
        text, screenshot_path = scrap(request.url)
        return {"content": text, "screenshot": screenshot_path}
    except Exception as e:
        print(f"[ERROR] Scraping failed: {e}")
        return {"error": str(e)}

# ai spin 
@call_pi.post("/spin")
def spin_f(request: Trequest):
    result = spin_content(request.text)
    version_id = save(result)
    return {"spun_text": result, "version_id": version_id}


# ai review on editing
@call_pi.post("/review")
def review_f(request: Trequest):
    result = aireview(request.text)
    return {"reviewed_text": result}




# save karne ke liye
@call_pi.post("/save_version")
def save_f(request: Trequest):
    version_id = request.version_id or "v1"
    save(request.text, version_id)
    return {"message": f"Version {version_id} saved successfully."}

# for retrieve
@call_pi.post("/retrieve")
def ret_f(request: Rrequest):
    result = retrieve(request.query)
    return {"results": result}

# for feedback result
@call_pi.post("/feedback")
def coll_f(request: Frequest):
    reward = rec_feedback(request.version_id, request.feedback)
    return {"message": "Feedback recorded", "reward": reward}

# accprding to feedback result
@call_pi.post("/ranked_results")
def get_ranked_f(request: Rrequest):
    similar_versions = retrieve(request.query)
    rewards = get_same_rewards()
    sorted_versions = sorted(
        similar_versions,
        key=lambda r: rewards.get(r["version_id"], 0),
        reverse=True
    )
    return {"results": sorted_versions}
