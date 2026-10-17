🌾 Sahay-AI (सहाय-AI)AI-Powered Business Advisory & Credit Navigation for Rural Micro-EntrepreneursAligned with Smart India Hackathon Themes:SIH26091: AI-Driven Micro-Enterprise Business Advisory & SWOT AnalysisSIH26092: Contextual Credit Navigation, Scheme Matching & Spatial Routing📌 Architecture Overviewsahay-ai/
├── backend/                  # FastAPI Application (Python 3.10+)
│   ├── main.py               # Application entry point & route registration
│   ├── sample_data/          # Automated test runners & SQL seed scripts
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment template
├── frontend/                 # Next.js 14 Web Portal (React 18 + Tailwind)
│   ├── package.json          # Node dependencies & scripts
│   └── app/                  # App router pages & components
└── README.md
Engine 1 (Advisory & Feasibility): Live OpenStreetMap (OSM) competitor density lookups combined with LLM-driven SWOT synthesis (Groq / Gemini fallback).Engine 2 (Credit Engine): Deterministic scheme matching and rural-calibrated reducing-balance EMI calculations.Engine 3 (Document & Verification): DigiLocker sandbox integration (OAuth 2.0 PKCE) and local Tesseract OCR pipeline.Engine 4 (Spatial Router): PostGIS-backed geospatial channel routing with automated fallback to an in-memory spatial router (Chhattisgarh Pilot Corridor).📋 Table of ContentsPrerequisitesEnvironment Configuration (.env)Step-by-Step InstallationBackend Setup (FastAPI)Frontend Setup (Next.js 14)Optional: PostGIS DatabaseOptional: Tesseract OCRRunning the ApplicationVerification & API TestingTroubleshooting & FAQ1. PrerequisitesVerify installed tools using your terminal:ToolRequired VersionVerification CommandNotesPython3.10.x or higherpython --versionEnsure pip is updatedNode.js18.x or 20.x LTSnode -vLTS recommendednpm9.x or highernpm -vBundled with NodeGitAny modern versiongit --versionFor version controlPostgreSQL (Optional)14.x+ with PostGISpsql -VFalls back to in-memory routing if skippedTesseract (Optional)4.x / 5.xtesseract --versionFor local OCR on raw image uploads2. Environment Configuration (.env)Configuration resides in backend/.env. Create this file by copying the template:Bash# Linux / macOS
cp backend/.env.example backend/.env

# Windows (Command Prompt)
copy backend\.env.example backend\.env

# Windows (PowerShell)
Copy-Item backend\.env.example backend\.env
Environment Variables Reference TableVariableRequirementDefault / RecommendedPurposeGROQ_API_KEYRecommendedgsk_...High-speed LLM inference for live SWOT generation.GROQ_MODELOptionalopenai/gpt-oss-120bModel family executed on Groq.GEMINI_API_KEYOptionalAIzaSy...Fallback LLM endpoint if Groq quota exhausts.GEMINI_MODELOptionalgemini-2.5-flashGemini model variant.DATABASE_URLOptional"" (Empty string)PostgreSQL connection string. Leave blank to run zero-dependency in-memory routing.DIGILOCKER_MOCK_MODERecommendedtrueSimulates KYC profiles without requiring live citizen credentials.DIGILOCKER_PARTNER_IDSandbox DevMNRNJVXEMeriPehchaan sandbox client identification.DIGILOCKER_CLIENT_SECRETSandbox Dev4ea7f92b...MeriPehchaan client secret key.DIGILOCKER_REDIRECT_URIDev Confighttp://localhost:8003/doc.phpRegistered OAuth 2.0 redirect target.DIGILOCKER_AUTH_URLSandbox Dev[https://dev-meripehchaan.dl6.in/public/oauth2/1/authorize](https://dev-meripehchaan.dl6.in/public/oauth2/1/authorize)Authorization challenge endpoint.DIGILOCKER_TOKEN_URLSandbox Dev[https://dev-meripehchaan.dl6.in/public/oauth2/1/token](https://dev-meripehchaan.dl6.in/public/oauth2/1/token)Token exchange endpoint.BHASHINI_API_KEYOptional""Vernacular voice synthesis (defaults to client-side Web Speech API).ALLOWED_ORIGINSRequiredhttp://localhost:3000Allowed CORS origins for frontend requests.3. Step-by-Step InstallationStep A: Backend (FastAPI)Enter the backend directory:Bashcd backend
Create and activate a clean Python virtual environment:macOS / Linux:Bashpython3 -m venv venv
source venv/bin/activate
Windows (PowerShell):PowerShellpython -m venv venv
.\venv\Scripts\Activate.ps1
(If script execution is disabled, run Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass first).Windows (Command Prompt):DOSpython -m venv venv
venv\Scripts\activate.bat
Install and upgrade core packages:Bashpip install --upgrade pip
pip install -r requirements.txt
Step B: Frontend (Next.js 14)Open a separate terminal window:Enter the frontend directory:Bashcd frontend
Install node dependencies:Bashnpm install
Step C: (Optional) PostgreSQL + PostGISSkip this step if you want to use the built-in zero-dependency in-memory spatial router.Create database in PostgreSQL:SQLCREATE DATABASE sahay_db;
Execute the spatial seed script:Bashpsql -U postgres -d sahay_db -f sample_data/channel_partners.sql
Set the connection string in backend/.env:Code snippetDATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sahay_db
Step D: (Optional) Tesseract OCRTesseract is required only if you plan to parse locally uploaded passbooks and ID cards instead of using mock DigiLocker profiles.Ubuntu / Debian:Bashsudo apt-get update && sudo apt-get install -y tesseract-ocr
macOS:Bashbrew install tesseract
Windows:Download the installer from the UB-Mannheim Tesseract repository.Install to C:\Program Files\Tesseract-OCR.Add C:\Program Files\Tesseract-OCR to your System Environment PATH.4. Running the Application1. Launch the Backend APIIn the backend terminal (with the virtual environment activated):Bashcd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
Base URL: http://localhost:8000Swagger UI Documentation: http://localhost:8000/docsReDoc Documentation: http://localhost:8000/redocService Health Endpoint: http://localhost:8000/health2. Launch the Frontend Development ServerIn the frontend terminal:Bashcd frontend
npm run dev
Application Portal: http://localhost:30005. Verification & API TestingAutomated Test SuiteWith the backend server running on port 8000, open a third terminal and run the automated test suite from the repository root:Bashpython backend/sample_data/run_tests.py
This script verifies:System Health Check (GET /health)Scheme Matching Algorithms (POST /api/schemes/match)Rural-specific Reducing Balance EMI Calculator (POST /api/schemes/match/{code}/emi)DigiLocker PKCE Code Verification (POST /api/schemes/digilocker/authorize)Document Readiness Assessment (POST /api/schemes/document-readiness)OpenStreetMap Competitor Query & SWOT Generation (POST /api/advisory/feasibility)Full Enterprise Advisory Report (POST /api/advisory/full-report)Manual cURL VerificationTest the scheme-matching engine directly with this sample payload:Bashcurl -X POST "http://localhost:8000/api/schemes/match" \
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
6. Troubleshooting & FAQSymptom / ErrorRoot CauseFixModuleNotFoundError: No module named 'fastapi'Python virtual environment not active.Activate the virtual environment (source venv/bin/activate or .\venv\Scripts\activate) before starting Uvicorn.LLM client not configured: 503Missing or invalid Groq/Gemini key in .env.Add a valid key to GROQ_API_KEY in backend/.env. The backend falls back to rule-based SWOT if omitted.pytesseract.TesseractNotFoundErrorThe Tesseract binary is not installed or not in system PATH.Install Tesseract via your system package manager and confirm with tesseract --version, or set DIGILOCKER_MOCK_MODE=true to skip OCR.CORS Error / Network Request FailedHost or port mismatch between frontend and backend.Confirm the backend runs on http://localhost:8000 and frontend on http://localhost:3000. Check ALLOWED_ORIGINS in backend/.env.connection to server at "localhost", port 5432 failedPostgreSQL service not running or bad credentials.Leave DATABASE_URL="" blank in backend/.env to run the in-memory spatial router without PostgreSQL.PowerShell: Execution_Policies errorPowerShell script execution restrictions.Run Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass in the current terminal window.
