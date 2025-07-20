
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from scraper import scrap
from ai_agents import spn, aireview
from chroma_utils import savdata, retrieve
from reward_engine import upd_qtable,get_pdt_re
from chroma_utils import sto

call_pi = FastAPI()

# Enable CORS
call_pi.add_middleware(

    CORSMiddleware,
    # all thing s we are allowing 
    allow_origins=["http://localhost:5173"],
    # set credentials 
    allow_credentials=True,

    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Schemas
class Srequest(BaseModel):
    ul: str

class Trequest(BaseModel):
    t: str
    version_id: Optional[str] = None

class Rrequest(BaseModel):
    quer: str

class Frequest(BaseModel):
    version_id: str
    feedback: str

@call_pi.post("/scrape")
def scrape(rqt: Srequest):
    
    print(f"Scraping: {rqt.ul}")
    txt, sc_pth = scrap(rqt.ul)
    return {"content": txt, "screenshot": sc_pth}
   
@call_pi.post("/spin")
def spin_f(rqt: Trequest):
    # spining of text form api key 
    print("hello");
    rt = spn(rqt.t)

    vsid = savdata(rt)
    return {"sp_txt": rt, "version_id": vsid}

@call_pi.post("/review")
def review_f(rqt: Trequest):
    rest = aireview(rqt.t)
    # making review no saveing 
    return {"reviewed_text": rest}

@call_pi.post("/save_version")
def save_f(rqt: Trequest):
    # assigining value 
    vsid = rqt.version_id;
    #  saving data
    savdata(rqt.t, vsid)
    return {"message": f"Version {vsid} saved successfully."}

@call_pi.post("/retrieve")
def ret_f(rqt: Rrequest):
    result = retrieve(rqt.quer)
    return {"results": result}

@call_pi.post("/feedback")
def coll_f(rqt: Frequest):
    #  getting version from 
    mtch = sto.get(rqt.version_id)
    # if else 
    if mtch:
        txt = mtch["documents"][0]
    else:
        txt = ""


    rew = upd_qtable(rqt.version_id, rqt.feedback, txt)
    #  return 
    return {"message": "Feedback recorded", "reward": rew}

def get_q_score(item):
    return item["q_score"]

@call_pi.post("/ranked_results")
def get_ranked_f(rqt: Rrequest):
    same_vs = retrieve(rqt.quer)
    # making a loop to iterate 
    for v in same_vs:
        v["q_score"] = get_pdt_re(v["text"])
   

    sort_vs = sorted(same_vs, key=get_q_score, reverse=True)

    return {"res": sort_vs}