#  AI-Driven Text Feedback and Search System

This project allows users to:
-  Scraping of content from web pages.
-  Use AI agents/api keys to spin (rephrase) and review text.
-  Save and id AI-generated content.
-  Search similar text using semantic similarity (ChromaDB).
-  Submit the feedback in the following (Accepted / Edited / Rejected) for reward-based learning.
-  View ranked results based on relevance and community feedback.

---

## Tech Stack

### Backend
- FastAPI – for api calls all.
- ChromaDB – vector DB to retrieve semantically similar versions.
- Pydantic – for data validity.
- Playwright – for webpage screenshot/scraping.

### Frontend
- React.js + Vite– frontend development or some minor funcitonality and for triggered updates.
- Tailwind CSS– styling.
- Fetch API – to communicate with backend.
- Icons – for intuitive UI feedback.

---

##  Project Structure

```bash
.
├── backend/
│   ├── main.py                 # FastAPI app with all routes
│   ├── reward_engine.py        # Feedback recording and reward logic
│   ├── scraper.py              # Page scraping logic
│   ├── ai_agents.py            # AI text spinning and reviewing functions
│   └── chroma_utils.py         # Save and retrieve from ChromaDB
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── VersionCard.jsx
│   │   └── pages/
│   │       └── SearchPage.jsx
|           └── EditorView.jsx
│   └── vite.config.js
│
└── README.md
