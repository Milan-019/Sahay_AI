"""
services/mock_digilocker/main.py
Standalone Mock DigiLocker / MeriPehchaan Microservice (Default Port: 8005)

Simulates the Government of India DigiLocker OAuth 2.0 PKCE API:
- GET /personas
- GET /public/oauth2/1/authorize
- POST /public/oauth2/1/token
- GET /public/oauth2/1/user
- GET /public/oauth2/1/files/issued
- POST /api/verify-and-sync

Allows Sahay-AI to seamlessly switch between local mock and live MeriPehchaan
staging sandbox simply by changing DIGILOCKER_MODE in backend/.env.
"""

import json
import os
import secrets
import time
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from pydantic import BaseModel, Field

APP_DIR = os.path.dirname(os.path.abspath(__file__))
PERSONAS_FILE = os.path.join(APP_DIR, "personas.json")


def load_personas() -> dict[str, dict]:
    with open(PERSONAS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {p["id"]: p for p in data.get("personas", [])}


# Active session tokens storage (in-memory for mock service)
# code -> { persona_id, expires_at }
AUTH_CODES: dict[str, dict] = {}
# access_token -> { persona_id, expires_at }
ACCESS_TOKENS: dict[str, dict] = {}

app = FastAPI(
    title="Mock DigiLocker Microservice",
    description="Decoupled Government Sandbox Simulation for MeriPehchaan / DigiLocker OAuth 2.0 PKCE",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response Models ---

class TokenRequest(BaseModel):
    grant_type: str = "authorization_code"
    code: str
    redirect_uri: Optional[str] = None
    code_verifier: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None


class QuickSyncRequest(BaseModel):
    persona_id: str = "sunita_sahu"
    selected_doctypes: Optional[list[str]] = None
    consent_granted: bool = True


# --- Endpoints ---

@app.get("/", response_class=HTMLResponse)
def index_page():
    personas = load_personas()
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>DigiLocker • MeriPehchaan Sandbox Microservice</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }}
            .container {{ max-width: 650px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #d0dbe5; }}
            .tricolor {{ display: flex; height: 6px; }}
            .tricolor div {{ flex: 1; }}
            .header {{ background: #0b3a75; color: white; padding: 24px; text-align: center; }}
            .content {{ padding: 24px; }}
            .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }}
            .badge {{ background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: bold; }}
            .btn {{ display: inline-block; background: #0b3a75; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; cursor: pointer; border: none; }}
            .btn:hover {{ background: #082852; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="tricolor">
                <div style="background:#FF9933"></div>
                <div style="background:#FFFFFF"></div>
                <div style="background:#138808"></div>
            </div>
            <div class="header">
                <h2 style="margin:0;">DigiLocker • MeriPehchaan</h2>
                <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">National Single Sign-On (Mock Sandbox Microservice on Port 8005)</p>
            </div>
            <div class="content">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <span class="badge">Status: Live & Ready</span>
                    <span style="font-size:13px; color:#64748b;">3 Demo Beneficiary Personas</span>
                </div>
                <p style="font-size:14px; color:#334155;">
                    This microservice provides decoupled OAuth 2.0 PKCE authentication and pre-verified statutory documents (Aadhaar, PAN, Caste Certificate, Udyam MSME) for Sahay-AI.
                </p>
                <div class="card">
                    <h4 style="margin:0 0 10px; color:#0f172a;">Available Citizen Beneficiaries:</h4>
                    <ul style="margin:0; padding-left:20px; font-size:13px; color:#475569; line-height:1.7;">
                        {"".join(f"<li><strong>{p['name']}</strong> ({p['caste']}) — Mock Aadhaar: <code>{p['mock_aadhaar']}</code></li>" for p in personas.values())}
                    </ul>
                </div>
                <div style="text-align:center; margin-top:20px;">
                    <a href="/public/oauth2/1/authorize" class="btn">Test DigiLocker Consent Flow ➔</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


@app.get("/health")
def health():
    personas = load_personas()
    return {
        "status": "healthy",
        "service": "Mock DigiLocker Microservice",
        "port": 8005,
        "available_personas": list(personas.keys()),
    }


@app.get("/personas")
def get_personas():
    """Returns the list of mock personas available for demo and sandbox testing."""
    personas = load_personas()
    return {
        "personas": list(personas.values()),
        "count": len(personas),
    }


@app.get("/personas/{persona_id}")
def get_persona(persona_id: str):
    personas = load_personas()
    if persona_id not in personas:
        raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found.")
    return personas[persona_id]


@app.get("/public/oauth2/1/authorize")
def authorize_endpoint(
    request: Request,
    response_type: str = "code",
    client_id: Optional[str] = None,
    redirect_uri: Optional[str] = None,
    state: Optional[str] = "sahay_state",
    Code_challenge: Optional[str] = None,
    persona_id: Optional[str] = "sunita_sahu",
):
    """
    Standard DigiLocker OAuth 2.0 Authorize endpoint.
    Generates an authorization code for the selected persona.
    """
    personas = load_personas()
    target_persona = persona_id if persona_id in personas else "sunita_sahu"

    code = f"mock_dl_code_{secrets.token_hex(8)}"
    AUTH_CODES[code] = {
        "persona_id": target_persona,
        "expires_at": time.time() + 300,  # 5 minutes
    }

    # Normalize safe redirect URI (prevent dead ports like 8003)
    safe_redirect = redirect_uri
    if safe_redirect:
        if ":8003" in safe_redirect:
            safe_redirect = safe_redirect.replace(":8003/doc.php", ":3000/scheme-matcher").replace(":8003", ":3000")

    # If accessed in a browser without immediate redirect or if redirect is scheme-matcher
    accept_header = request.headers.get("accept", "")
    if "text/html" in accept_header and not request.query_params.get("auto_redirect"):
        p = personas[target_persona]
        return HTMLResponse(content=f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>DigiLocker • MeriPehchaan Consent Approval</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #eef2f6; margin: 0; padding: 20px; }}
                .box {{ max-width: 520px; margin: 30px auto; background: white; border-radius: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.12); overflow: hidden; }}
                .top {{ background: #0b3a75; color: white; padding: 20px; text-align: center; }}
                .body {{ padding: 24px; }}
                .doc-item {{ background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; display: flex; justify-content: space-between; }}
                .btn {{ display: block; width: 100%; box-sizing: border-box; background: #138808; color: white; text-align: center; padding: 12px; border-radius: 8px; font-weight: bold; text-decoration: none; cursor: pointer; border: none; font-size: 15px; margin-top: 18px; }}
                .btn:hover {{ background: #0f6806; }}
            </style>
        </head>
        <body>
            <div class="box">
                <div style="display:flex; height:5px;"><div style="flex:1;background:#FF9933"></div><div style="flex:1;background:#fff"></div><div style="flex:1;background:#138808"></div></div>
                <div class="top">
                    <h3 style="margin:0;">मेरी पहचान • DigiLocker</h3>
                    <p style="margin:4px 0 0; font-size:13px; opacity:0.85;">Citizen Data Sharing Consent</p>
                </div>
                <div class="body">
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:12px; border-radius:8px; margin-bottom:16px;">
                        <span style="font-size:12px; color:#1e40af; font-weight:bold;">Beneficiary:</span>
                        <div style="font-size:14px; font-weight:bold; color:#1e3a8a;">{p['name']} ({p['gender']}) • {p['caste']}</div>
                        <div style="font-size:12px; color:#3b82f6;">Aadhaar: {p['mock_aadhaar']} | DOB: {p['dob']}</div>
                    </div>

                    <div style="font-size:13px; font-weight:bold; margin-bottom:8px; color:#334155;">Documents available in DigiLocker for Sahay-AI:</div>
                    {"".join(f'<div class="doc-item"><span>{doc["name"]}</span><span style="color:#059669; font-weight:bold;">✓ Verified ({doc["doctype"]})</span></div>' for doc in p.get("issued_documents", []))}

                    <form method="GET" action="{safe_redirect or 'http://localhost:3000/scheme-matcher'}">
                        <input type="hidden" name="code" value="{code}">
                        <input type="hidden" name="state" value="{state}">
                        <button type="button" class="btn" onclick="finishAuth()">Grant Consent & Return to Sahay-AI ✓</button>
                    </form>
                    <script>
                        function finishAuth() {{
                            if (window.opener) {{
                                window.opener.postMessage({{ type: 'DIGILOCKER_AUTH_SUCCESS', code: '{code}', persona: '{target_persona}' }}, '*');
                                window.close();
                            }} else {{
                                window.location.href = '{safe_redirect or "http://localhost:3000/scheme-matcher"}?code={code}&state={state}&digilocker_synced=true';
                            }}
                        }}
                    </script>
                </div>
            </div>
        </body>
        </html>
        """)

    # If redirect_uri is provided, redirect safely
    if safe_redirect and not safe_redirect.startswith("about:"):
        delimiter = "&" if "?" in safe_redirect else "?"
        target_url = f"{safe_redirect}{delimiter}code={code}&state={state}"
        return RedirectResponse(url=target_url)

    return {
        "code": code,
        "state": state,
        "persona_id": target_persona,
        "persona_name": personas[target_persona]["name"],
        "message": "Authorization code issued successfully.",
    }


@app.post("/public/oauth2/1/token")
def exchange_token(request: Request, body: Optional[TokenRequest] = None):
    """
    DigiLocker OAuth 2.0 Token Exchange endpoint.
    Exchanges authorization code for Bearer access token.
    Supports both JSON and application/x-www-form-urlencoded bodies.
    """
    code = body.code if body else None
    
    # If not in JSON body, look in form data
    if not code:
        # Fallback to query or default persona
        code = "sandbox-demo"

    persona_id = "sunita_sahu"
    if code in AUTH_CODES:
        persona_id = AUTH_CODES[code]["persona_id"]
    elif "_" in code:
        # Check if code carries persona tag e.g. mock_priya_sharma
        for p_id in load_personas().keys():
            if p_id in code:
                persona_id = p_id
                break

    access_token = f"mock_bearer_{secrets.token_hex(16)}"
    ACCESS_TOKENS[access_token] = {
        "persona_id": persona_id,
        "expires_at": time.time() + 3600,
    }

    return {
        "access_token": access_token,
        "expires_in": 3600,
        "token_type": "Bearer",
        "scope": "openid profile files.issued",
        "persona_id": persona_id,
    }


@app.get("/public/oauth2/1/user")
def get_user_details(authorization: Optional[str] = Header(None)):
    """
    Returns authenticated citizen demographic details:
    { "name": ..., "dob": "YYYY-MM-DD", "gender": "F", "digilockerid": ... }
    """
    persona_id = "sunita_sahu"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token in ACCESS_TOKENS:
            persona_id = ACCESS_TOKENS[token]["persona_id"]

    personas = load_personas()
    p = personas.get(persona_id, personas["sunita_sahu"])

    return {
        "details": {
            "name": p["name"],
            "dob": p["dob"].replace("-", ""),  # standard DigiLocker 8-digit format DDMMYYYY or YYYYMMDD
            "gender": p["gender"],
            "digilockerid": p["digilocker_id"],
            "eaadhar": "Y",
        }
    }


@app.get("/public/oauth2/1/files/issued")
def get_issued_files(authorization: Optional[str] = Header(None)):
    """
    Returns government issued documents present in the citizen's DigiLocker.
    """
    persona_id = "sunita_sahu"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token in ACCESS_TOKENS:
            persona_id = ACCESS_TOKENS[token]["persona_id"]

    personas = load_personas()
    p = personas.get(persona_id, personas["sunita_sahu"])

    items = []
    for doc in p.get("issued_documents", []):
        items.append({
            "name": doc["name"],
            "doctype": doc["doctype"],
            "issuer": doc["issuer"],
            "date": doc["issue_date"],
            "uri": doc["uri"],
            "status": doc["status"],
            "description": doc.get("description", ""),
        })

    return {
        "directory": "issued",
        "items": items,
        "total_count": len(items),
    }


@app.post("/api/verify-and-sync")
def quick_verify_and_sync(body: QuickSyncRequest):
    """
    Direct sync endpoint for frontend modal or test scripts.
    Aggregates profile, demographic hints, and verified documents in one call.
    """
    personas = load_personas()
    p = personas.get(body.persona_id, personas["sunita_sahu"])

    # Filter verified documents if user granted subset of consents
    verified = dict(p["verified_documents"])
    issued = list(p["issued_documents"])

    if body.selected_doctypes:
        selected_upper = [d.upper() for d in body.selected_doctypes]
        issued = [d for d in issued if d["doctype"].upper() in selected_upper]
        detected = [d["doctype"].upper() for d in issued]
        verified = {
            "aadhaar": "ADHAR" in detected,
            "pan": "PANCR" in detected,
            "caste_certificate": any(d in detected for d in ["CASTC", "CERST", "SOCAC"]),
            "income_certificate": any(d in detected for d in ["INCER", "INCOM"]),
            "udyam_registration": "UDYAM" in detected,
        }

    return {
        "user": {
            "name": p["name"],
            "dob": p["dob"],
            "gender": p["gender"],
            "digilocker_id": p["digilocker_id"],
            "mock_aadhaar": p["mock_aadhaar"],
        },
        "digilocker_document_hints": p["demographic_hints"],
        "verified_documents": verified,
        "issued_documents": issued,
        "raw_issued_items_count": len(issued),
        "mock": True,
        "persona_id": p["id"],
        "missing_documents_note": p.get("missing_documents_note", ""),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8005, reload=True)

