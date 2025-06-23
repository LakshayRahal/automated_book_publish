import google.generativeai as llm
import os
from dotenv import load_dotenv

load_dotenv()
llm.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = llm.GenerativeModel(model_name="gemini-1.5-flash") 


# content of spin displayed here 

def spin_content(text: str) -> str:
    prompt = f"""
    Rewrite the following text in a unique way, keeping the original meaning intact.
    Make it engaging and readable while avoiding plagiarism:

    \"\"\"{text}\"\"\"
    """
    try:
        re = model.generate_content(prompt)
        return re.text.strip()
    except Exception as e:
        print("Error during spin_text:", e)
        return "An error occurred while spinning the text."

# ai review or suggestion this part
def aireview(text: str) -> str:
    prompt = f"""
    Review the following text and provide constructive feedback about clarity, grammar,
    and how it can be improved for a general audience:

    \"\"\"{text}\"\"\"
    """
    try:
        r = model.generate_content(prompt)
        return r.text.strip()
    except Exception as e:
        print("Error during review_text:", e)
        return "An error occurred while reviewing the text."
