# Sahay-AI (सहाय-AI)

> **Empowering India's Grassroots & Rural Entrepreneurs with Hyper-Local AI Business Feasibility, Sovereign Scheme Matching, and Spatial Credit Navigation.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostGIS](https://img.shields.io/badge/Spatial-PostgreSQL_%2F_PostGIS-336791?style=flat&logo=postgresql&logoColor=white)](https://postgis.net)
[![Groq](https://img.shields.io/badge/LLM-Groq_%2F_Gemini_2.5-F55036?style=flat)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Platform Focus: Rural Enterprise Empowerment

Sahay-AI integrates two critical, complementary capabilities into an end-to-end platform:
- **Enterprise Feasibility & Advisory:** AI-driven hyper-local market feasibility, competitor density analysis, and business advisory for small-scale rural ventures.
- **Credit Navigation & Readiness:** Automated government scheme tiering, reducing-balance EMI schedules, document readiness verification, and channel partner branch allocation.

Together, these modules form an end-to-end companion that guides a rural entrepreneur from **ideation** $\to$ **market validation** $\to$ **sovereign scheme pre-qualification** $\to$ **bank-ready documentation**.

---

## 🌟 The Core Problems & The Sahay-AI Solution

| Traditional Bottleneck | The Sahay-AI Solution |
| :--- | :--- |
| **Feasibility Blindspots:** Rural entrepreneurs launch ventures without competitor data, leading to high failure rates. | **Engine 1 (Hyper-Local Feasibility):** Queries live OpenStreetMap Overpass API for real-time competitor density and grounds SWOT in Census 2011 Primary Census Abstracts. |
| **Credit Scheme Confusion:** Fragmented schemes (PMMY, Stand-Up India, NSFDC, PMEGP, PM Vishwakarma) with confusing margin slabs. | **Engine 2 (Mathematical Financier):** Applies strict 10% equity margin logic, handles affirmative precedence, stacks interest subventions, and calculates quarterly harvest-aligned EMIs. |
| **The "Branch Ping-Pong" Syndrome:** Entrepreneurs walk into banks only to be rejected due to exhausted quotas or NPA locks. | **Engine 3 (Spatial Router):** PostGIS GIST routing matches nearest solvent branches with remaining fund quotas and outputs a transparent bypass audit log. |
| **Documentation Deficits:** Incomplete files or spelling mismatches cause weeks of delay. | **Document Readiness Subsystem:** MeriPehchaan / DigiLocker OAuth PKCE sync + Tesseract OCR extraction with fuzzy identity matching. |
| **The Language & Formal Banking Barrier:** Intimidating bank interactions and jargon. | **Voice & Bank Slip Companion:** Multilingual localized voice advisory (Hindi, Marathi, Tamil, English) + one-click printable **"Bank Manager Slip"**. |

---

## 🏛️ System Architecture

Sahay-AI uses a decoupled, resilient architecture designed to function smoothly even when external APIs or databases encounter intermittent connectivity:

```
                                      ┌────────────────────────────────────────────────────────┐
                                      │              Next.js 14 Frontend Client                │
                                      │  (Multilingual • Tailwind • Lucide • Web Speech TTS)   │
                                      └──────────────────────────┬─────────────────────────────┘
                                                                 │ HTTP / JSON
                                                                 ▼
                                      ┌────────────────────────────────────────────────────────┐
                                      │               FastAPI Gateway (Port 8000)              │
                                      │           (/api/schemes/*, /api/advisory/*)            │
                                      └──────┬───────────────────┬──────────────────────┬──────┘
                                             │                   │                      │
                   ┌─────────────────────────┴─────────┐         │         ┌────────────┴──────────────────────┐
                   │                                   │         │         │                                   │
                   ▼                                   ▼         │         ▼                                   ▼
        ┌─────────────────────┐             ┌────────────────────┤  ┌──────────────┐                 ┌───────────────────┐
        │      Engine 1       │             │      Engine 2      │  │   Engine 3   │                 │ Document Verifier │
        │ Feasibility & SWOT  │             │ Scheme & Precedence│  │Spatial Router│                 │  & DigiLocker     │
        └──────────┬──────────┘             └──────────┬─────────┘  └──────┬───────┘                 └─────────┬─────────┘
                   │                                   │                   │                                   │
      ┌────────────┴────────────┐             ┌────────┴────────┐   ┌──────┴──────┐                   ┌────────┴────────┐
      ▼                         ▼             ▼                 ▼   ▼             ▼                   ▼                 ▼
 ┌─────────┐              ┌───────────┐  ┌─────────┐      ┌────────┐┌─────┐   ┌───────┐           ┌─────────┐     ┌───────────┐
 │OpenStreet│             │Census 2011│  │Rule     │      │Harvest ││Post │   │Solven-│           │DigiLock-│     │Tesseract  │
 │Map (OSM)│              │Demograph. │  │Engine   │      │EMI Calc││GIS  │   │cy &   │           │er OAuth │     │OCR Engine │
 │Overpass │              │Abstract   │  │(PMMY/SU)│      │Model   ││Index│   │Quota  │           │(PKCE)   │     │Extraction │
 └─────────┘              └───────────┘  └─────────┘      └────────┘└─────┘   └───────┘           └─────────┘     └───────────┘
```

> 📖 **Deep Dive:** Detailed diagrams, sequence charts, and mathematical models are documented in [ARCHITECTURE.md](file:///d:/Work/sahayAI/ARCHITECTURE.md).

---

## ⚡ Key Modules

### 1. Engine 1: Hyper-Local Feasibility & SWOT Grounding
- **Real-Time Competitor Discovery:** Live bounding-circle queries against OpenStreetMap's Overpass API (`tailor`, `carpenter`, `dairy`, `retail`, `welding`, etc.).
- **Demographic Baselines:** Direct lookups from RGI Census 2011 Primary Census Abstract (households, density, female literacy, SC/ST proportion).
- **Multi-Model LLM Reasoning:** Synthesizes strengths, weaknesses, opportunities, threats, pricing strategies, and tailored voice scripts using Groq (`openai/gpt-oss-120b`) or Google Gemini (`gemini-2.5-flash`), backed by a deterministic rule-based regional fallback.
- **Vernacular Audio Scripts:** Native scripts generated in **Hindi**, **Marathi**, **Tamil**, and **English**.

### 2. Engine 2: Mathematical Financier & Scheme Matcher
- **Fixed 10% Margin Invariant:** Computes `Project Cost = Available Margin / 0.10` and `Loan Amount = Project Cost * 0.90` per official RBI and Mudra guidelines.
- **Affirmative Scheme Hierarchy:** Evaluates schemes in strict order:
  1. *Stand-Up India:* Greenfield projects, Women or SC/ST, loans ₹10L–₹100L.
  2. *PMMY (Mudra):* Non-farm micro-enterprises up to ₹10L (Shishu, Kishore, Tarun).
  3. *NSFDC Mahila Samridhi Yojana:* Concessional 4.0% credit for SC women under family income caps (₹3.0L rural / ₹3.5L urban).
- **Subvention Stacking:** Applies 100 bps reduction for women entrepreneurs, 50 bps reduction for SC/ST applicants, with a hard regulatory floor of 5.0%.
- **Harvest-Aligned Reducing-Balance EMI:** Converts quarterly EMIs into intuitive rural unit analogies (e.g., *"Repayment equals 3 stitched suits/day"*).

### 3. Engine 3: Channel Partner Spatial Router
- **High-Performance Spatial SQL:** Queries bank branches using PostGIS geography points and GIST indices:
  ```sql
  SELECT branch_name, institution_type, ST_Distance(location, ST_MakePoint(lon, lat)::geography) AS distance_meters
  FROM channel_partners
  WHERE scheme_code = ANY(serves_scheme_codes) AND is_solvent = TRUE AND fund_quota_remaining >= loan_amount
  ORDER BY distance_meters ASC LIMIT 3;
  ```
- **Solvency & Quota Guard:** Immediately filters out branches flagged for regulatory Prompt Corrective Action (PCA) or exhausted quarterly quotas.
- **Bypass Audit Trail:** Records detailed explanations for skipped branches to ensure transparency.
- **In-Memory Fallback:** Includes a zero-dependency in-memory Haversine spatial router if PostgreSQL is not configured.

### 4. Document Readiness & DigiLocker Sandbox
- **MeriPehchaan / DigiLocker OAuth 2.0 PKCE:** Secure authorization and token exchange flow. Includes `DIGILOCKER_MOCK_MODE=true` to test safely without exposing live PII.
- **Tesseract OCR Extraction:** OCR pipeline for manual image uploads (bank passbooks, caste certificates, address proofs).
- **Fuzzy Identity Cross-Checking:** Verifies extracted document names against declared applicant identity.

### 5. Bank Manager Slip & Grassroots Companion
- **Official Print Artifact:** Prepares a bank-formatted summary slip detailing applicant readiness, loan feasibility, and verified documents for direct branch submission.
- **Multilingual Voice Assistant:** Hands-free voice summaries powered by the browser Web Speech API.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Python 3.10+, FastAPI, Pydantic v2, Uvicorn, HTTPX, python-dotenv |
| **Artificial Intelligence** | Groq API (`openai/gpt-oss-120b`), Google Gemini (`google-genai`), OpenStreetMap Overpass API |
| **Spatial Database** | PostgreSQL 15+, PostGIS 3.3+, Psycopg2, In-Memory Spatial Fallback |
| **Computer Vision / OCR**| Tesseract OCR, PyTesseract, Pillow (PIL) |
| **Frontend Framework** | Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React Icons |
| **Internationalization** | Built-in localization (Hindi `hi`, English `en`, Marathi `mr`, Tamil `ta`) |

---

## 📂 Repository Structure

```
sahayAI/
├── ARCHITECTURE.md             # In-depth system architecture & diagrams
├── README.md                   # This project manual
├── backend/                    # FastAPI backend service
│   ├── .env                    # Environment configuration
│   ├── main.py                 # FastAPI application entrypoint
│   ├── requirements.txt        # Backend dependencies
│   ├── engine/                 # Core domain logic
│   │   ├── feasibility.py      # Engine 1: Overpass OSM + Census + LLM SWOT
│   │   ├── finance.py          # Engine 2: Margin multiplier, tiering & EMIs
│   │   ├── spatial.py          # Engine 3: PostGIS & in-memory spatial router
│   │   ├── document_readiness.py # OCR extraction & document validator
│   │   └── rules.py            # Eligibility aliases and constants
│   └── routers/
│       ├── advisory.py         # /api/advisory (Feasibility & Full Report)
│       └── schemes.py          # /api/schemes (Matching, EMI, DigiLocker, Docs)
├── frontend/                   # Next.js 14 frontend web app
│   ├── package.json            # Frontend dependencies and scripts
│   ├── tailwind.config.js      # Styling configuration
│   ├── app/
│   │   ├── page.jsx            # Landing page & scheme showcase
│   │   ├── business-advisor/   # Module 1: Feasibility & competitor map
│   │   ├── scheme-matcher/     # Module 2: Credit calculator & DigiLocker sync
│   │   └── companion/          # Module 3: End-to-end report & bank slip
│   ├── components/
│   │   ├── Navbar.jsx          # Multilingual header navigation
│   │   ├── BankManagerSlip.jsx # Official printable branch submission slip
│   │   └── VoiceSummaryPlayer.jsx # Audio playback companion
│   └── locales/
│       └── translations.js     # Multilingual dictionary (EN, HI, MR, TA)
└── sample_data/                # Sample test data & verification scripts
    ├── applicants.json         # Realistic applicant profiles
    ├── feasibility_requests.json # Sample market feasibility queries
    ├── channel_partners.sql    # PostgreSQL + PostGIS schema and seed script
    ├── channel_partners.json   # Seed bank branches with geo-coordinates
    ├── digilocker_mock.json    # DigiLocker OAuth sandbox mock response
    ├── test_requests.http      # VS Code / Postman test collection
    └── run_tests.py            # Automated API integration test runner
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm
- *(Optional)* **PostgreSQL + PostGIS** (if testing real PostGIS; in-memory fallback runs automatically if `DATABASE_URL` is unset)
- *(Optional)* **Tesseract OCR binary** installed on your system PATH (for local OCR parsing)

---

### 2. Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Verify or edit backend/.env with your API keys:
# - GROQ_API_KEY / GEMINI_API_KEY (for live LLM SWOT)
# - DIGILOCKER_MOCK_MODE=true (for zero-PII local development)
```

#### Run Backend Server:
```bash
uvicorn main:app --reload --port 8000
```
- API will be accessible at: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

Open a second terminal window:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install npm dependencies
npm install

# 3. Launch Next.js dev server
npm run dev
```
- Frontend application will be live at: `http://localhost:3000`

---

## 🧪 Testing with Sample Data

Sahay-AI comes with ready-to-run sample data and automated tests located in [sample_data/](file:///d:/Work/sahayAI/sample_data).

### Option A: Run the Automated Python Test Runner
With the backend running on port 8000:
```bash
python sample_data/run_tests.py
```
This tests:
1. Health check `/health`
2. Scheme matching `/api/schemes/match`
3. Reducing-balance EMI calculation `/api/schemes/match/{code}/emi`
4. DigiLocker PKCE generation `/api/schemes/digilocker/authorize`
5. Document readiness verification `/api/schemes/document-readiness`
6. Hyper-local feasibility `/api/advisory/feasibility`
7. End-to-end full advisory report `/api/advisory/full-report`

### Option B: Execute REST Requests
Use [sample_data/test_requests.http](file:///d:/Work/sahayAI/sample_data/test_requests.http) inside VS Code (using REST Client) or import into Postman/Bruno.

---

## 🔌 API Reference Highlights

### `POST /api/schemes/match`
Evaluates applicant profile, computes project cost via 10% margin rule, and returns ranked scheme offers.

**Request Body:**
```json
{
  "available_margin": 14000.0,
  "is_women_entrepreneur": true,
  "is_sc_st": true,
  "is_greenfield": true,
  "annual_family_income": 220000.0,
  "is_rural": true,
  "trade_category": "tailor",
  "language": "hi"
}
```

**Response (Summary):**
```json
[
  {
    "scheme_code": "NSFDC_MAHILA_SAMRIDHI",
    "scheme_name": "NSFDC — Mahila Samridhi Yojana",
    "project_cost": 140000.0,
    "loan_amount": 126000.0,
    "margin_required": 14000.0,
    "effective_interest_rate": 0.04,
    "tenure_years": 3,
    "moratorium_months": 3,
    "is_affirmative_scheme": true,
    "rebates_applied": ["SC/ST Category", "Women Concessional Rate"]
  }
]
```

---

### `POST /api/advisory/feasibility`
Queries live OSM competitors, pulls Census demographic baselines, and generates a structured SWOT analysis.

**Request Body:**
```json
{
  "block_name": "patan",
  "latitude": 21.0366,
  "longitude": 81.5369,
  "trade_category": "tailor",
  "radius_meters": 5000,
  "language": "hi"
}
```

---

### `POST /api/advisory/full-report`
Executes the unified end-to-end flow: **Engine 1** (Feasibility) $\to$ **Engine 2** (Scheme Match) $\to$ **Engine 3** (Spatial Partner Allocation) $\to$ **Document Readiness Check**.

---

## 🏆 Key Innovations & Architecture Highlights

1. **Deterministic Rule Engine + Real Grounding:** Rather than asking an LLM to hallucinate government rules, our financial tiering and margin math run on deterministic, auditable Python logic with strict regulatory floors.
2. **Algorithmic Bypass Audit Trail:** When bank branches are skipped due to zero quota or high NPA stress, the system preserves an auditable record explaining why the entrepreneur was routed elsewhere.
3. **Inclusive Dialects & Voice-First Access:** Rural micro-entrepreneurs can listen to their market feasibility in their native dialect and carry a physical, auto-generated **Bank Manager Slip** to minimize branch intimidation.
4. **Zero-PII Dev Sandbox:** The MeriPehchaan / DigiLocker integration contains full PKCE cryptography alongside an isolated sandbox toggle, allowing end-to-end demonstrations without compromising citizen data.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](file:///d:/Work/sahayAI/backend/LICENSE) file for details.
