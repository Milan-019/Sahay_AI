Sahay-AI (सहाय-AI) — Setup & Configuration Guide
AI-Powered Business Advisory & Credit Navigation Platform for Rural Micro-Entrepreneurs
Aligned with Smart India Hackathon: SIH26091 (Business Advisory) & SIH26092 (Credit Navigation)

📋 Table of Contents


System Prerequisites


Environment Variables Reference (
.env
)


Backend Setup (FastAPI)


Frontend Setup (Next.js 14)


Database Setup (Optional: PostgreSQL + PostGIS)


Tesseract OCR Setup (Optional for Document Verification)


Running the Application


Verifying the Setup & Sample Testing


Troubleshooting Common Issues
1. System Prerequisites
Ensure the following tools are installed on your machine:

Python: 3.10 or higher (python --version)
Node.js: 18.x or higher (node -v)
npm: 9.x or higher (npm -v)
Git: (git --version)
(Optional) PostgreSQL 14+ with PostGIS extension (The backend automatically falls back to an in-memory spatial router if not configured).
(Optional) Tesseract OCR (Required only for live image text extraction in document readiness).
2. Environment Variables Reference (.env)
The backend configuration lives in backend/.env. Below is the complete reference table:

Variable	Required?	Default / Sample Value	Description & Source
GROQ_API_KEY	Recommended	gsk_...	Primary LLM key for fast SWOT synthesis. Get a free key from Groq Console.
GROQ_MODEL	Optional	openai/gpt-oss-120b	Model used on Groq.
GEMINI_API_KEY	Optional	AIzaSy...	Fallback LLM key for SWOT generation. Get from Google AI Studio.
GEMINI_MODEL	Optional	gemini-2.5-flash	Gemini model variant.
DATABASE_URL	Optional	postgresql://user:pass@localhost:5432/sahay_db	Connection string for PostGIS spatial partner router. If left blank, falls back to in-memory routing.
DIGILOCKER_MOCK_MODE	Recommended for Dev	true	When set to true, uses a sandbox mock profile (zero real PII required, no live Aadhaar roundtrip needed).
DIGILOCKER_PARTNER_ID	Optional	MNRNJVXE	MeriPehchaan / DigiLocker partner sandbox ID.
DIGILOCKER_CLIENT_SECRET	Optional	4ea7f92b...	MeriPehchaan client secret.
DIGILOCKER_REDIRECT_URI	Optional	http://localhost:8003/doc.php	Registered OAuth 2.0 redirect callback URL.
DIGILOCKER_AUTH_URL	Optional	https://dev-meripehchaan.dl6.in/public/oauth2/1/authorize	DigiLocker OAuth sandbox authorization URL.
DIGILOCKER_TOKEN_URL	Optional	https://dev-meripehchaan.dl6.in/public/oauth2/1/token	DigiLocker token endpoint.
BHASHINI_API_KEY	Optional	""	Bhashini voice synthesis key (Web Speech API is used by default in the browser).
ALLOWED_ORIGINS	Optional	http://localhost:3000	Frontend origins allowed via CORS.
Sample backend/.env File:
env
# --- Engine 1 (SWOT & Feasibility) ---
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
# --- Engine 3 (Spatial Router) ---
# Leave blank to use zero-dependency in-memory spatial router
DATABASE_URL=
# --- Document Readiness & DigiLocker ---
DIGILOCKER_MOCK_MODE=true
DIGILOCKER_PARTNER_ID=MNRNJVXE
DIGILOCKER_CLIENT_SECRET=4ea7f92b2aaa68726457
DIGILOCKER_REDIRECT_URI=http://localhost:8003/doc.php
DIGILOCKER_AUTH_URL=https://dev-meripehchaan.dl6.in/public/oauth2/1/authorize
DIGILOCKER_TOKEN_URL=https://dev-meripehchaan.dl6.in/public/oauth2/1/token
# --- Server Config ---
ALLOWED_ORIGINS=http://localhost:3000
3. Backend Setup (FastAPI)
Open a terminal and follow these steps:

Step 3.1: Navigate to Backend Directory
bash
cd backend
Step 3.2: Create and Activate a Virtual Environment
On Windows (PowerShell):
powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
On Windows (Command Prompt):
cmd
python -m venv venv
venv\Scripts\activate.bat
On macOS / Linux:
bash
python3 -m venv venv
source venv/bin/activate
Step 3.3: Install Dependencies
bash
pip install --upgrade pip
pip install -r requirements.txt
Step 3.4: Configure Environment File
Create or verify .env inside backend/:

bash
# On Linux / macOS
cp .env.example .env
# On Windows
copy .env.example .env
Ensure DIGILOCKER_MOCK_MODE=true is set for hassle-free local testing without real citizen credentials.

4. Frontend Setup (Next.js 14)
Open a separate terminal window:

Step 4.1: Navigate to Frontend Directory
bash
cd frontend
Step 4.2: Install Dependencies
bash
npm install
Step 4.3: Verify Next.js Configuration
The frontend automatically proxies requests or calls the backend at http://localhost:8000. No separate frontend .env is mandatory for local dev.

5. Database Setup (Optional: PostgreSQL + PostGIS)
Note: If you do not have PostgreSQL installed, you can skip this step! The backend includes a built-in in-memory spatial fallback (route_application_in_memory()) seeded with the Chhattisgarh pilot corridor.

If running with a real PostGIS instance:

Create a database in PostgreSQL:
sql
CREATE DATABASE sahay_db;
Enable PostGIS and seed the database using the provided seed file:
bash
psql -U postgres -d sahay_db -f sample_data/channel_partners.sql
Update DATABASE_URL in backend/.env:
env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sahay_db
6. Tesseract OCR Setup (Optional)
Tesseract is used by the Document Readiness checker to read text from uploaded passbooks and ID cards.

Windows:
Download the installer from UB-Mannheim/tesseract.
Install it (default path: C:\Program Files\Tesseract-OCR).
Add C:\Program Files\Tesseract-OCR to your system PATH.
Ubuntu / Debian:
bash
sudo apt-get update && sudo apt-get install -y tesseract-ocr
macOS:
bash
brew install tesseract
7. Running the Application
Start the Backend Server
In your backend terminal (with the virtual environment activated):

bash
cd backend
uvicorn main:app --reload --port 8000
API Address: http://localhost:8000
Swagger Interactive Docs: http://localhost:8000/docs
Health Check: http://localhost:8000/health
Start the Frontend Server
In your frontend terminal:

bash
cd frontend
npm run dev
Web App Address: http://localhost:3000
8. Verifying the Setup & Sample Testing
Method 1: Run the Automated Test Script
With the backend server running on port 8000, run this from the project root:

bash
python sample_data/run_tests.py
This tests:

Health check (/health)
Scheme matching algorithm (/api/schemes/match)
Reducing-balance EMI with rural metrics (/api/schemes/match/{code}/emi)
DigiLocker PKCE generation (/api/schemes/digilocker/authorize)
Document readiness verification (/api/schemes/document-readiness)
Live OSM competitor query + SWOT synthesis (/api/advisory/feasibility)
Full advisory pipeline (/api/advisory/full-report)
Method 2: Test via cURL
Test scheme matching for a rural SC/ST woman tailor:

bash
curl -X POST "http://localhost:8000/api/schemes/match" \
  -H "Content-Type: application/json" \
  -d '{
    "available_margin": 14000.0,
    "is_women_entrepreneur": true,
    "is_sc_st": true,
    "is_greenfield": true,
    "annual_family_income": 220000.0,
    "is_rural": true,
    "trade_category": "tailor",
    "language": "hi"
  }'
9. Troubleshooting Common Issues
Issue	Cause	Resolution
ModuleNotFoundError: No module named 'fastapi'	Virtual environment not active	Activate the virtual environment (.\venv\Scripts\activate or source venv/bin/activate) before running uvicorn.
LLM client not configured: 503	Missing or invalid Groq/Gemini key	Provide a free Groq API key in backend/.env under GROQ_API_KEY. If unconfigured, the engine falls back to rule-based SWOT.
TesseractNotFoundError	Tesseract binary not in system PATH	Install Tesseract OCR or skip image uploads (DigiLocker-verified documents bypass OCR automatically).
CORS errors in browser console	Backend port mismatch	Ensure the backend is running on port 8000 and frontend on 3000. Check ALLOWED_ORIGINS in backend/.env.
PostgreSQL connection refused	Database server stopped or URL incorrect	Leave DATABASE_URL= empty in backend/.env to run in zero-dependency in-memory spatial mode.
