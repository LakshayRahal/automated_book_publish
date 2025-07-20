from reward_engine import upd_qtable
import google.generativeai as aiKey
import os
from dotenv import load_dotenv
# loading dotenv file 
load_dotenv()
# loading key 
aiKey.configure(api_key=os.getenv("GEMINI_API_KEY"))

mdl = aiKey.GenerativeModel(model_name="gemini-1.5-flash")

# spiining of txt
def spn(tx: str) -> str:
    pmt = f"""
    Rewrite the following text in a unique and human-like manner. Retain original meaning, improve readability, and avoid plagiarism:

    \"\"\"{tx}\"\"\"
    """
    ans = mdl.generate_content(pmt)
    return ans.text.strip()
    # spun

# review by gemini
def aireview(tx: str) -> str:
    pmt = f"""
    Review this text and give suggestions to improve clarity, grammar, and structure for a general audience:

    \"\"\"{tx}\"\"\"
    """
    # generating ai review 
    ans = mdl.generate_content(pmt)
    # giving ans 
    return ans.text.strip()
    
