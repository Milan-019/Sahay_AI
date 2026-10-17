# 🌾 Sahay-AI (सहाय-AI)

### AI-Powered Business Advisory & Credit Navigation for Rural Micro-Entrepreneurs

> **Aligned with Smart India Hackathon Themes:**
> * **SIH26091:** AI-Driven Micro-Enterprise Business Advisory & SWOT Analysis
> * **SIH26092:** Contextual Credit Navigation, Scheme Matching & Spatial Routing
> 
> 

---

## 📌 Architecture Overview

```
sahay-ai/
├── backend/                  # FastAPI Application (Python 3.10+)
│   ├── main.py               # Application entry point & route registration
│   ├── sample_data/          # Automated test runners & SQL seed scripts
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment template
├── frontend/                 # Next.js 14 Web Portal (React 18 + Tailwind)
│   ├── package.json          # Node dependencies & scripts
│   └── app/                  # App router pages & components
└── README.md

```

* **Engine 1 (Advisory & Feasibility):** Live OpenStreetMap (OSM) competitor density lookups combined with LLM-driven SWOT synthesis (Groq / Gemini fallback).
* **Engine 2 (Credit Engine):** Deterministic scheme matching and rural-calibrated reducing-balance EMI calculations.
* **Engine 3 (Document & Verification):** DigiLocker sandbox integration (OAuth 2.0 PKCE) and local Tesseract OCR pipeline.
* **Engine 4 (Spatial Router):** PostGIS-backed geospatial channel routing with automated fallback to an in-memory spatial router (Chhattisgarh Pilot Corridor).

---

## 📋 Table of Contents

1. [Prerequisites](https://www.google.com/search?q=%231-prerequisites)
2. [Environment Configuration (`.env`)](https://www.google.com/search?q=%232-environment-configuration-env)
3. [Step-by-Step Installation](https://www.google.com/search?q=%233-step-by-step-installation)
* [Backend Setup (FastAPI)](https://www.google.com/search?q=%23step-a-backend-fastapi)
* [Frontend Setup (Next.js 14)](https://www.google.com/search?q=%23step-b-frontend-nextjs-14)
* [Optional: PostGIS Database](https://www.google.com/search?q=%23step-c-optional-postgresql--postgis)
* [Optional: Tesseract OCR](https://www.google.com/search?q=%23step-d-optional-tesseract-ocr)


4. [Running the Application](https://www.google.com/search?q=%234-running-the-application)
5. [Verification & API Testing](https://www.google.com/search?q=%235-verification--api-testing)
6. [Troubleshooting & FAQ](https://www.google.com/search?q=%236-troubleshooting--faq)

---

## 1. Prerequisites

Verify installed tools using your terminal:

| Tool | Required Version | Verification Command | Notes |
| --- | --- | --- | --- |
| **Python** | `3.10.x` or higher | `python --version` | Ensure `pip` is updated |
| **Node.js** | `18.x` or `20.x` LTS | `node -v` | LTS recommended |
| **npm** | `9.x` or higher | `npm -v` | Bundled with Node |
| **Git** | Any modern version | `git --version` | For version control |
| **PostgreSQL** *(Optional)* | `14.x`+ with PostGIS | `psql -V` | Falls back to in-memory routing if skipped |
| **Tesseract** *(Optional)* | `4.x` / `5.x` | `tesseract --version` | For local OCR on raw image uploads |

---

## 2. Environment Configuration (`.env`)

Configuration resides in `backend/.env`. Create this file by copying the template:

```bash
# Linux / macOS
cp backend/.env.example backend/.env

# Windows (Command Prompt)
copy backend\.env.example backend\.env

# Windows (PowerShell)
Copy-Item backend\.env.example backend\.env

```

### Environment Variables Reference Table

| Variable | Requirement | Default / Recommended | Purpose |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | **Recommended** | `gsk_...` | High-speed LLM inference for live SWOT generation. |
| `GROQ_MODEL` | Optional | `openai/gpt-oss-120b` | Model family executed on Groq. |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Fallback LLM endpoint if Groq quota exhausts. |
| `GEMINI_MODEL` | Optional | `gemini-2.5-flash` | Gemini model variant. |
| `DATABASE_URL` | Optional | `""` (Empty string) | PostgreSQL connection string. **Leave blank** to run zero-dependency in-memory routing. |
| `DIGILOCKER_MOCK_MODE` | **Recommended** | `true` | Simulates KYC profiles without requiring live citizen credentials. |
| `DIGILOCKER_PARTNER_ID` | Sandbox Dev | `MNRNJVXE` | MeriPehchaan sandbox client identification. |
| `DIGILOCKER_CLIENT_SECRET` | Sandbox Dev | `4ea7f92b...` | MeriPehchaan client secret key. |
| `DIGILOCKER_REDIRECT_URI` | Dev Config | `http://localhost:8003/doc.php` | Registered OAuth 2.0 redirect target. |
| `DIGILOCKER_AUTH_URL` | Sandbox Dev | `[https://dev-meripehchaan.dl6.in/public/oauth2/1/authorize](https://dev-meripehchaan.dl6.in/public/oauth2/1/authorize)` | Authorization challenge endpoint. |
| `DIGILOCKER_TOKEN_URL` | Sandbox Dev | `[https://dev-meripehchaan.dl6.in/public/oauth2/1/token](https://dev-meripehchaan.dl6.in/public/oauth2/1/token)` | Token exchange endpoint. |
| `BHASHINI_API_KEY` | Optional | `""` | Vernacular voice synthesis (defaults to client-side Web Speech API). |
| `ALLOWED_ORIGINS` | Required | `http://localhost:3000` | Allowed CORS origins for frontend requests. |

---

## 3. Step-by-Step Installation

### Step A: Backend (FastAPI)

1. **Enter the backend directory:**
```bash
cd backend

```


2. **Create and activate a clean Python virtual environment:**
* **macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate

```


* **Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1

```


*(If script execution is disabled, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*
* **Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat

```




3. **Install and upgrade core packages:**
```bash
pip install --upgrade pip
pip install -r requirements.txt

```



---

### Step B: Frontend (Next.js 14)

Open a **separate terminal window**:

1. **Enter the frontend directory:**
```bash
cd frontend

```


2. **Install node dependencies:**
```bash
npm install

```



---

### Step C: (Optional) PostgreSQL + PostGIS

*Skip this step if you want to use the built-in zero-dependency in-memory spatial router.*

1. **Create database in PostgreSQL:**
```sql
CREATE DATABASE sahay_db;

```


2. **Execute the spatial seed script:**
```bash
psql -U postgres -d sahay_db -f sample_data/channel_partners.sql

```


3. **Set the connection string in `backend/.env`:**
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sahay_db

```



---

### Step D: (Optional) Tesseract OCR

Tesseract is required only if you plan to parse locally uploaded passbooks and ID cards instead of using mock DigiLocker profiles.

* **Ubuntu / Debian:**
```bash
sudo apt-get update && sudo apt-get install -y tesseract-ocr

```


* **macOS:**
```bash
brew install tesseract

```


* **Windows:**
1. Download the installer from the UB-Mannheim Tesseract repository.
2. Install to `C:\Program Files\Tesseract-OCR`.
3. Add `C:\Program Files\Tesseract-OCR` to your System Environment `PATH`.



---

## 4. Running the Application

### 1. Launch the Backend API

In the backend terminal (with the virtual environment activated):

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```

* **Base URL:** `http://localhost:8000`
* **Swagger UI Documentation:** `http://localhost:8000/docs`
* **ReDoc Documentation:** `http://localhost:8000/redoc`
* **Service Health Endpoint:** `http://localhost:8000/health`

### 2. Launch the Frontend Development Server

In the frontend terminal:

```bash
cd frontend
npm run dev

```

* **Application Portal:** `http://localhost:3000`

---

## 5. Verification & API Testing

### Automated Test Suite

With the backend server running on port 8000, open a third terminal and run the automated test suite from the repository root:

```bash
python backend/sample_data/run_tests.py

```

This script verifies:

1. System Health Check (`GET /health`)
2. Scheme Matching Algorithms (`POST /api/schemes/match`)
3. Rural-specific Reducing Balance EMI Calculator (`POST /api/schemes/match/{code}/emi`)
4. DigiLocker PKCE Code Verification (`POST /api/schemes/digilocker/authorize`)
5. Document Readiness Assessment (`POST /api/schemes/document-readiness`)
6. OpenStreetMap Competitor Query & SWOT Generation (`POST /api/advisory/feasibility`)
7. Full Enterprise Advisory Report (`POST /api/advisory/full-report`)

### Manual cURL Verification

Test the scheme-matching engine directly with this sample payload:

```bash
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

```

---

## 6. Troubleshooting & FAQ

| Symptom / Error | Root Cause | Fix |
| --- | --- | --- |
| `ModuleNotFoundError: No module named 'fastapi'` | Python virtual environment not active. | Activate the virtual environment (`source venv/bin/activate` or `.\venv\Scripts\activate`) before starting Uvicorn. |
| `LLM client not configured: 503` | Missing or invalid Groq/Gemini key in `.env`. | Add a valid key to `GROQ_API_KEY` in `backend/.env`. The backend falls back to rule-based SWOT if omitted. |
| `pytesseract.TesseractNotFoundError` | The Tesseract binary is not installed or not in system `PATH`. | Install Tesseract via your system package manager and confirm with `tesseract --version`, or set `DIGILOCKER_MOCK_MODE=true` to skip OCR. |
| `CORS Error / Network Request Failed` | Host or port mismatch between frontend and backend. | Confirm the backend runs on `http://localhost:8000` and frontend on `http://localhost:3000`. Check `ALLOWED_ORIGINS` in `backend/.env`. |
| `connection to server at "localhost", port 5432 failed` | PostgreSQL service not running or bad credentials. | Leave `DATABASE_URL=""` blank in `backend/.env` to run the in-memory spatial router without PostgreSQL. |
| PowerShell: `Execution_Policies` error | PowerShell script execution restrictions. | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in the current terminal window. |
