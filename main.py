"""
main.py
Sahay-AI FastAPI entrypoint. Wires the scheme-matching (SIH26092) and
advisory (SIH26091) routers together, both ultimately calling into the
three engines in engine/.

Run locally with: uvicorn main:app --reload --port 8000
Requires environment variables: GEMINI_API_KEY (Engine 1), DATABASE_URL
(Engine 3's real path — optional, falls back to in-memory routing).
"""

import sys
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Response
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

# Ensure the backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from .env
load_dotenv()

from routers import sih_schemes, advisory, voice

app = FastAPI(
    title="Sahay-AI API",
    description="AI-powered business advisory and credit navigation for rural entrepreneurs.",
    version="0.1.0",
)

# Loosened for hackathon dev; tighten allow_origins to the deployed
# frontend URL(s) before this goes anywhere near production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sih_schemes.router)
app.include_router(advisory.router)
app.include_router(voice.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Sahay-AI API",
        "version": "0.1.0",
        "docs_url": "/docs",
        "health_url": "/health",
        "endpoints": {
            "scheme_matching": "/api/schemes/match",
            "emi_calculation": "/api/schemes/match/{scheme_code}/emi",
            "digilocker_auth": "/api/schemes/digilocker/authorize",
            "document_readiness": "/api/schemes/document-readiness",
            "feasibility_advisory": "/api/advisory/feasibility",
            "full_advisory_report": "/api/advisory/full-report",
            "voice_tts": "/api/voice/tts",
            "voice_status": "/api/voice/status",
        }
    }


@app.get("/doc", include_in_schema=False)
def doc_redirect():
    return RedirectResponse(url="/docs")


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)


@app.get("/health")
def health_check():
    return {"status": "ok"}