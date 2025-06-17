import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(model_name="gemini-1.5-flash") 

def spin_text(text: str) -> str:
    prompt = f"""
    Rewrite the following text in a unique way, keeping the original meaning intact.
    Make it engaging and readable while avoiding plagiarism:

    \"\"\"{text}\"\"\"
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Error during spin_text:", e)
        return "An error occurred while spinning the text."


def review_text(text: str) -> str:
    prompt = f"""
    Review the following text and provide constructive feedback about clarity, grammar,
    and how it can be improved for a general audience:

    \"\"\"{text}\"\"\"
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Error during review_text:", e)
        return "An error occurred while reviewing the text."
