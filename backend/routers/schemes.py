"""routers/schemes.py

Endpoints for scheme matching, EMI schedules,
and DigiLocker sandbox OAuth verification.
Wraps engine/finance.py (Engine 2).
"""

import base64
import datetime
import hashlib
import os
from fastapi import APIRouter, HTTPException
import httpx
from pydantic import BaseModel, Field

from engine.finance import (
    AFFIRMATIVE_SCHEMES,
    Applicant,
    SchemeTier,
    generate_emi_schedule,
    get_scheme_offer_by_code,
    match_schemes,
    resolve_scheme_code,
)
from engine.document_readiness import (
    DeclaredIdentity,
    DocumentSubmission,
    DocumentType,
    check_readiness,
    resolve_document_type,
)

router = APIRouter(prefix="/api/schemes", tags=["scheme-matching"])

# Sandbox Configuration
PARTNER_ID = os.getenv("DIGILOCKER_PARTNER_ID", "MNRNJVXE")
CLIENT_SECRET = os.getenv("DIGILOCKER_CLIENT_SECRET", "4ea7f92b2aaa68726457")
REDIRECT_URI = os.getenv(
    "DIGILOCKER_REDIRECT_URI", "http://localhost:8003/doc.php"
)

AUTH_URL = os.getenv(
    "DIGILOCKER_AUTH_URL",
    "https://dev-meripehchaan.dl6.in/public/oauth2/1/authorize",
)
TOKEN_URL = os.getenv(
    "DIGILOCKER_TOKEN_URL", "https://dev-meripehchaan.dl6.in/public/oauth2/1/token"
)
USER_URL = os.getenv(
    "DIGILOCKER_USER_URL", "https://dev-meripehchaan.dl6.in/public/oauth2/1/user"
)
ISSUED_FILES_URL = os.getenv(
    "DIGILOCKER_ISSUED_URL",
    "https://dev-meripehchaan.dl6.in/public/oauth2/2/files/issued",
)


# --- Schemas ---


class ApplicantRequest(BaseModel):
  available_margin: float = Field(
      ..., gt=0, description="Applicant's available margin capital in INR"
  )
  is_women_entrepreneur: bool = False
  is_sc_st: bool = False
  is_greenfield: bool = True
  annual_family_income: float | None = Field(
      None, description="Required only for NSFDC eligibility check"
  )
  is_rural: bool = True
  trade_category: str = "tailor"
  language: str = "hi"  # "en", "hi", "mr", "ta"


class SchemeOfferResponse(BaseModel):
  scheme_code: str
  scheme_name: str
  project_cost: float
  loan_amount: float
  margin_required: float
  effective_interest_rate: float
  tenure_years: int
  moratorium_months: int
  is_affirmative_scheme: bool
  rebates_applied: list[str]


class EmiScheduleResponse(BaseModel):
  scheme_code: str
  principal: float
  annual_interest_rate: float
  moratorium_quarters: int
  repayment_quarters: int
  quarterly_emi: float
  total_repayment: float
  rural_metrics: dict | None = None


class DigiLockerTokenRequest(BaseModel):
  code: str
  code_verifier: str


class DocumentSubmissionRequest(BaseModel):
  document_type: str
  image_base64: str | None = None
  digilocker_fetched: bool = False
  manual_name: str | None = None
  manual_id_number: str | None = None


class DocumentReadinessRequest(BaseModel):
  scheme_code: str
  applicant_full_name: str
  applicant_date_of_birth: str
  is_sc_st: bool = False
  # Pass straight through from verify_and_sync_digilocker's "verified_documents"
  # dict — e.g. {"aadhaar": true, "pan": true, "caste_certificate": false, ...}.
  # Anything True here is treated as pre-verified (OCR skipped), same as a
  # DocumentSubmission with digilocker_fetched=True.
  digilocker_verified_documents: dict[str, bool] = Field(default_factory=dict)
  # Any additional documents the applicant uploaded manually (e.g. bank
  # passbook photo, business plan) that DigiLocker doesn't carry.
  submitted_documents: list[DocumentSubmissionRequest] = Field(default_factory=list)


class DocumentReadinessResponse(BaseModel):
  is_ready: bool
  required_documents: list[str]
  missing_documents: list[str]
  ocr_mismatch_count: int
  ocr_mismatch_details: list[dict]
  sourced_from_digilocker: list[str]
  extracted_documents: list[dict] = Field(default_factory=list)


# DigiLocker's verified_documents keys (see verify_and_sync_digilocker) ->
# the engine's DocumentType. Keep this in sync if either side's naming
# changes. "udyam_registration" has no corresponding DocumentType yet since
# no current scheme requires it — add one if that changes.
_DIGILOCKER_KEY_TO_DOCUMENT_TYPE: dict[str, DocumentType] = {
    "aadhaar": DocumentType.AADHAAR,
    "pan": DocumentType.PAN,
    "caste_certificate": DocumentType.CASTE_CERTIFICATE,
    "income_certificate": DocumentType.INCOME_CERTIFICATE,
}


# --- Helpers ---


def _generate_pkce() -> tuple[str, str]:
  verifier = (
      base64.urlsafe_b64encode(os.urandom(32)).decode("utf-8").rstrip("=")
  )
  digest = hashlib.sha256(verifier.encode("utf-8")).digest()
  challenge = base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")
  return verifier, challenge


def _normalize_digilocker_dob(raw_dob: str | None) -> str | None:
  """
  DigiLocker's /oauth2/1/user returns dob as plain digits, DDMMYYYY
  (e.g. "31121970"). Not currently consumed by any comparison logic in
  engine/document_readiness.py (DeclaredIdentity.date_of_birth is stored
  but unused today), but normalizing at the source means if/when DOB
  cross-checking is ever added, it won't silently break on format
  mismatch. Returns ISO "YYYY-MM-DD", or the original string unchanged
  if it doesn't match the expected 8-digit pattern (fail safe, not silent
  — the raw value is preserved rather than dropped or guessed at).
  """
  if raw_dob and len(raw_dob) == 8 and raw_dob.isdigit():
    dd, mm, yyyy = raw_dob[:2], raw_dob[2:4], raw_dob[4:]
    return f"{yyyy}-{mm}-{dd}"
  return raw_dob


# --- DigiLocker Sandbox Endpoints ---


@router.get("/digilocker/authorize")
async def get_digilocker_auth_url(state: str = "sahay_state_123"):
  """Step 1: Returns authorization URL with generated PKCE challenge."""
  verifier, challenge = _generate_pkce()
  params = {
      "client_id": PARTNER_ID,
      "response_type": "code",
      "redirect_uri": REDIRECT_URI,
      "state": state,
      "Code_challenge": challenge,
      "Code_challenge_method": "S256",
  }
  query_str = "&".join(f"{k}={v}" for k, v in params.items())
  return {
      "auth_url": f"{AUTH_URL}?{query_str}",
      "code_verifier": verifier,
  }


_MOCK_DIGILOCKER_RESPONSE = {
    "user": {
        "name": "Priya Sharma",
        "dob": "1970-12-31",
        "gender": "F",
        "digilocker_id": "mock-user-id-0001",
    },
    "digilocker_document_hints": {
        "is_women_entrepreneur": True,
        "has_linked_caste_certificate": True,
    },
    "verified_documents": {
        "aadhaar": True,
        "pan": True,
        "caste_certificate": True,
        "income_certificate": False,
        "udyam_registration": False,
    },
    "raw_issued_items_count": 3,
    "mock": True,  # always present when this path is used — never mistaken for a real response
}


@router.post("/digilocker/verify-and-sync")
async def verify_and_sync_digilocker(body: DigiLockerTokenRequest):
  """Exchanges code for access token, then queries User Details and Issued Documents

  to auto-construct an Applicant profile and document checklist.

  DEV MOCK MODE: set DIGILOCKER_MOCK_MODE=true in the environment to skip
  the real DigiLocker sandbox entirely — no Aadhaar needed, no real OAuth
  round-trip, no dependency on the sandbox being reachable. Also keeps
  real PII completely out of your local dev/test loop, which matters
  independent of convenience. Response always carries "mock": true.
  """
  if os.getenv("DIGILOCKER_MOCK_MODE", "").lower() == "true":
    return _MOCK_DIGILOCKER_RESPONSE

  token_payload = {
      "grant_type": "authorization_code",
      "code": body.code,
      "redirect_uri": REDIRECT_URI,
      "code_verifier": body.code_verifier,
      "client_id": PARTNER_ID,
      "client_secret": CLIENT_SECRET,
  }

  async with httpx.AsyncClient() as client:
    # 1. Exchange Token
    token_resp = await client.post(
        TOKEN_URL,
        data=token_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    if token_resp.status_code != 200:
      raise HTTPException(
          status_code=token_resp.status_code,
          detail=f"Token exchange failed: {token_resp.text}",
      )

    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Query User Details
    user_resp = await client.get(USER_URL, headers=headers)
    user_details = (
        user_resp.json().get("details", {})
        if user_resp.status_code == 200
        else {}
    )

    # 3. Query Issued Files
    files_resp = await client.get(ISSUED_FILES_URL, headers=headers)
    issued_files = (
        files_resp.json().get("items", [])
        if files_resp.status_code == 200
        else []
    )

  # 4. Map user details to applicant profile
  gender = user_details.get("gender", "")
  is_women = gender.upper() == "F"

  # Map available doctypes to document readiness checklist
  detected_doctypes = [f.get("doctype", "").upper() for f in issued_files]
  verified_documents = {
      "aadhaar": (
          "ADHAR" in detected_doctypes or user_details.get("eaadhar") == "Y"
      ),
      "pan": "PANCR" in detected_doctypes,
      "caste_certificate": any(
          d in detected_doctypes for d in ["CASTC", "CERST", "SOCAC"]
      ),
      "income_certificate": any(
          d in detected_doctypes for d in ["INCER", "INCOM"]
      ),
      "udyam_registration": "UDYAM" in detected_doctypes,
  }

  return {
      "user": {
          "name": user_details.get("name"),
          "dob": _normalize_digilocker_dob(user_details.get("dob")),
          "gender": gender,
          "digilocker_id": user_details.get("digilockerid"),
      },
      # IMPORTANT — these are DOCUMENT-PRESENCE SIGNALS, not confirmed
      # applicant identity. "is_sc_st" here means "a caste certificate
      # happens to be linked in this user's DigiLocker" — it is FALSE for
      # an SC/ST applicant who simply hasn't linked/issued that document
      # yet, which is a common case, not an edge case. DO NOT pass this
      # value directly into Applicant.is_sc_st for scheme matching or into
      # /document-readiness's is_sc_st field. The applicant's own explicit
      # declaration (a checkbox: "Do you belong to SC/ST category?") is
      # the authoritative source for eligibility — this field exists only
      # to pre-fill that checkbox as a suggestion, which the applicant can
      # override in either direction.
      "digilocker_document_hints": {
          "is_women_entrepreneur": is_women,
          "has_linked_caste_certificate": verified_documents["caste_certificate"],
      },
      "verified_documents": verified_documents,
      "raw_issued_items_count": len(issued_files),
  }


# --- Core Scheme Matching Endpoints ---


@router.post("/match", response_model=list[SchemeOfferResponse])
def match_applicant_schemes(request: ApplicantRequest):
  applicant = Applicant(
      available_margin=request.available_margin,
      is_women_entrepreneur=request.is_women_entrepreneur,
      is_sc_st=request.is_sc_st,
      is_greenfield=request.is_greenfield,
      annual_family_income=request.annual_family_income,
      is_rural=request.is_rural,
  )
  try:
    offers = match_schemes(applicant)
  except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))

  return [
      SchemeOfferResponse(
          scheme_code=o.scheme_code,
          scheme_name=o.scheme_name,
          project_cost=o.project_cost,
          loan_amount=o.loan_amount,
          margin_required=o.margin_required,
          effective_interest_rate=o.effective_interest_rate,
          tenure_years=o.tenure_years,
          moratorium_months=o.moratorium_months,
          is_affirmative_scheme=o.is_affirmative_scheme,
          rebates_applied=o.rebates_applied,
      )
      for o in offers
  ]


@router.post("/match/{scheme_code}/emi", response_model=EmiScheduleResponse)
def get_emi_for_scheme(scheme_code: str, request: ApplicantRequest):
  applicant = Applicant(
      available_margin=request.available_margin,
      is_women_entrepreneur=request.is_women_entrepreneur,
      is_sc_st=request.is_sc_st,
      is_greenfield=request.is_greenfield,
      annual_family_income=request.annual_family_income,
      is_rural=request.is_rural,
  )
  canonical_code = resolve_scheme_code(scheme_code)
  offers = match_schemes(applicant)
  matched = next((o for o in offers if o.scheme_code == canonical_code), None)

  # Not in the eligible match list — check WHY before assuming "unknown code".
  if matched is None:
    is_recognized_code = (
        canonical_code in (SchemeTier.MICRO_FINANCE.value, SchemeTier.TERM_LOAN.value)
        or any(s.code == canonical_code for s in AFFIRMATIVE_SCHEMES)
    )
    if not is_recognized_code:
      raise HTTPException(
          status_code=404,
          detail=(
              f"Scheme '{scheme_code}' is not recognized. Supported schemes/aliases: "
              "STAND_UP_INDIA, PMMY (MUDRA), NSFDC (MAHILA SAMRIDHI), MICRO_FINANCE, TERM_LOAN, PMEGP."
          ),
      )
    # Recognized code, but get_scheme_offer_by_code will return None if the
    # applicant genuinely doesn't qualify — surface that as 403, not a
    # fabricated offer (see finance.py's get_scheme_offer_by_code docstring).
    matched = get_scheme_offer_by_code(canonical_code, applicant)
    if matched is None:
      raise HTTPException(
          status_code=403,
          detail=(
              f"This applicant does not meet the eligibility criteria for "
              f"'{canonical_code}' (e.g. loan amount out of range, category/"
              f"income requirements not met, or wrong tier for this margin "
              f"amount). Call /api/schemes/match to see schemes this "
              f"applicant actually qualifies for."
          ),
      )

  emi = generate_emi_schedule(
      matched,
      trade_category=request.trade_category,
      language=request.language,
  )
  return EmiScheduleResponse(**emi)


@router.post("/document-readiness", response_model=DocumentReadinessResponse)
def check_document_readiness(request: DocumentReadinessRequest):
  """
  Document readiness, combining two sources in one check:
    1. DigiLocker-verified documents (digilocker_verified_documents dict,
       taken straight from verify_and_sync_digilocker's response) — these
       skip OCR entirely since DigiLocker already verified them against
       the government's own records.
    2. Manually uploaded documents (submitted_documents) — run through
       OCR and cross-checked against the applicant's declared identity,
       for anything DigiLocker doesn't cover (bank passbook, business
       plan, greenfield declaration, etc.).

  This is the actual connection point between the DigiLocker OAuth flow
  above and the document readiness engine: call /digilocker/verify-and-sync
  first, then pass its "verified_documents" straight into this endpoint's
  digilocker_verified_documents field.
  """
  canonical_code = resolve_scheme_code(request.scheme_code)
  submissions: list[DocumentSubmission] = []
  sourced_from_digilocker: list[str] = []

  for key, is_verified in request.digilocker_verified_documents.items():
    if not is_verified:
      continue
    doc_type = _DIGILOCKER_KEY_TO_DOCUMENT_TYPE.get(key)
    if doc_type is None:
      continue  # e.g. "udyam_registration" — no engine DocumentType yet, skip silently
    submissions.append(DocumentSubmission(document_type=doc_type, digilocker_fetched=True))
    sourced_from_digilocker.append(doc_type.value)

  for doc_req in request.submitted_documents:
    doc_type = resolve_document_type(doc_req.document_type)
    if doc_type is None:
      raise HTTPException(
          status_code=400,
          detail=(
              f"Unknown document_type '{doc_req.document_type}'. Supported: "
              "AADHAAR, PAN, BANK_PASSBOOK, BUSINESS_PLAN (or PROJECT_REPORT), "
              "CASTE_CERTIFICATE, INCOME_CERTIFICATE, GREENFIELD_DECLARATION, "
              "ADDRESS_PROOF, PASSPORT_PHOTO."
          ),
      )

    image_bytes = None
    if doc_req.image_base64:
      try:
        image_bytes = base64.b64decode(doc_req.image_base64)
      except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid base64 for {doc_req.document_type}")

    submissions.append(DocumentSubmission(
        document_type=doc_type, image_bytes=image_bytes,
        digilocker_fetched=doc_req.digilocker_fetched,
        manual_name=doc_req.manual_name,
        manual_id_number=doc_req.manual_id_number,
    ))

  identity = DeclaredIdentity(
      full_name=request.applicant_full_name, date_of_birth=request.applicant_date_of_birth,
  )
  readiness = check_readiness(
      scheme_code=canonical_code, submissions=submissions,
      declared_identity=identity, routed_via_sc_st=request.is_sc_st,
  )
  return DocumentReadinessResponse(
      is_ready=readiness.is_ready,
      required_documents=[d.value for d in readiness.required_documents],
      missing_documents=[d.value for d in readiness.missing_documents],
      ocr_mismatch_count=len(readiness.ocr_flags),
       ocr_mismatch_details=[
          {"document_type": f.document_type.value, "extracted_name": f.extracted_name}
          for f in readiness.ocr_flags
      ],
      sourced_from_digilocker=sourced_from_digilocker,
      extracted_documents=[
          {
              "document_type": ext.document_type.value,
              "extracted_name": ext.extracted_name,
              "extracted_id_number": ext.extracted_id_number,
              "raw_text": ext.raw_text,
              "name_matches_declared": ext.name_matches_declared,
          }
          for ext in readiness.ocr_extractions
      ],
  )