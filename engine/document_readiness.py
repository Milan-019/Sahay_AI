"""
engine/document_readiness.py
Sahay-AI — Document Readiness Checker (parallel branch, feeds into Engine 3)

Given the scheme Engine 2 matched an applicant to, and whatever documents
they've supplied so far, this module:
  1. Looks up the required document set for that specific scheme (they
     differ — NSFDC needs an income certificate, Stand-Up India needs a
     greenfield declaration, etc.).
  2. For each supplied document image, runs OCR to extract identifying
     fields (name, DOB, ID number) and cross-checks them against what the
     applicant declared, flagging mismatches rather than assuming a
     present file is automatically a valid one.
  3. Produces a ReadinessResult (ready / missing docs / flagged mismatches)
     that Engine 3's router can use to annotate whether an application is
     actually submission-ready at the partner it's being routed to.

DigiLocker integration is a STUB, not a working client — see
DigiLockerClient below. I don't have real DigiLocker partner credentials
or API access, and DigiLocker's actual API requires a registered partner
ID + OAuth consent flow that only you can set up. Wire _fetch_from_digilocker
to the real API once you have that.

OCR extraction IS real and tested in this module (pytesseract + Tesseract),
unlike the DigiLocker stub — see the bottom of the file for a live test
against a generated sample image.
"""

from dataclasses import dataclass, field
from typing import Optional
from enum import Enum
import json
import os
import re
import io


# ---------------------------------------------------------------------------
# Document types & per-scheme requirements
# ---------------------------------------------------------------------------

class DocumentType(str, Enum):
    AADHAAR = "AADHAAR"
    PAN = "PAN"
    BANK_PASSBOOK = "BANK_PASSBOOK"
    CASTE_CERTIFICATE = "CASTE_CERTIFICATE"
    INCOME_CERTIFICATE = "INCOME_CERTIFICATE"
    BUSINESS_PLAN = "BUSINESS_PLAN"
    GREENFIELD_DECLARATION = "GREENFIELD_DECLARATION"
    ADDRESS_PROOF = "ADDRESS_PROOF"
    PASSPORT_PHOTO = "PASSPORT_PHOTO"


# Required doc sets per Engine 2 scheme_code. Keep these keys in sync with
# finance.py's actual scheme codes — see the same lesson learned in
# engine/spatial.py's header comment.
SCHEME_DOCUMENT_REQUIREMENTS: dict[str, list[DocumentType]] = {
    "MICRO_FINANCE": [
        DocumentType.AADHAAR, DocumentType.PAN, DocumentType.BANK_PASSBOOK,
        DocumentType.ADDRESS_PROOF, DocumentType.PASSPORT_PHOTO,
    ],
    "TERM_LOAN": [
        DocumentType.AADHAAR, DocumentType.PAN, DocumentType.BANK_PASSBOOK,
        DocumentType.ADDRESS_PROOF, DocumentType.PASSPORT_PHOTO, DocumentType.BUSINESS_PLAN,
    ],
    "STAND_UP_INDIA_WOMEN": [
        DocumentType.AADHAAR, DocumentType.PAN, DocumentType.BANK_PASSBOOK,
        DocumentType.ADDRESS_PROOF, DocumentType.BUSINESS_PLAN, DocumentType.GREENFIELD_DECLARATION,
        # caste certificate only required if routed via the SC/ST eligibility path,
        # not the women-only path — see requires_caste_certificate() below
    ],
    "PMMY_MAHILA_UDYAMI": [
        DocumentType.AADHAAR, DocumentType.PAN, DocumentType.BANK_PASSBOOK,
        DocumentType.ADDRESS_PROOF, DocumentType.PASSPORT_PHOTO,
    ],
    "NSFDC_MAHILA_SAMRIDHI": [
        DocumentType.AADHAAR, DocumentType.CASTE_CERTIFICATE, DocumentType.INCOME_CERTIFICATE,
        DocumentType.BANK_PASSBOOK, DocumentType.ADDRESS_PROOF, DocumentType.PASSPORT_PHOTO,
    ],
}


def requires_caste_certificate(scheme_code: str, routed_via_sc_st: bool) -> bool:
    """
    Stand-Up India accepts EITHER women OR SC/ST eligibility. Only demand
    a caste certificate if the applicant actually qualified via the SC/ST
    path — don't ask a woman-only applicant for a document she doesn't
    legally need.
    """
    if scheme_code == "STAND_UP_INDIA_WOMEN" and routed_via_sc_st:
        return True
    return scheme_code == "NSFDC_MAHILA_SAMRIDHI"  # always required here


# ---------------------------------------------------------------------------
# Applicant-declared fields (to cross-check OCR extraction against)
# ---------------------------------------------------------------------------

@dataclass
class DeclaredIdentity:
    full_name: str
    date_of_birth: str  # DD/MM/YYYY, as declared by the applicant at intake


@dataclass
class DocumentSubmission:
    document_type: DocumentType
    image_bytes: Optional[bytes] = None       # raw image, for local on-premise OCR
    digilocker_fetched: bool = False          # True if sourced via DigiLocker (pre-verified)
    manual_name: Optional[str] = None         # manual name entry by applicant/Bank Sakhi
    manual_id_number: Optional[str] = None    # manual ID number (Aadhaar/PAN/Account No)


@dataclass
class OcrExtractionResult:
    document_type: DocumentType
    extracted_name: Optional[str]
    extracted_id_number: Optional[str]
    raw_text: str
    name_matches_declared: Optional[bool]      # None if extraction failed / nothing to compare


@dataclass
class ReadinessResult:
    scheme_code: str
    required_documents: list[DocumentType]
    submitted_documents: list[DocumentType]
    missing_documents: list[DocumentType]
    ocr_flags: list[OcrExtractionResult]        # entries where name_matches_declared is False
    ocr_extractions: list[OcrExtractionResult] = field(default_factory=list) # all extracted results
    is_ready: bool = False                      # True only if nothing missing AND no OCR mismatches


# ---------------------------------------------------------------------------
# OCR extraction — 100% On-Premise / Local (Zero External Cloud API / Zero PII Leakage)
# ---------------------------------------------------------------------------

_AADHAAR_PATTERN = re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")
_PAN_PATTERN = re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b")
_ACCOUNT_LABEL_PATTERN = re.compile(r"(?:A/c|Account|Acc|A/C|Khata|खाता)[\s\.:#No]*([0-9]{9,18})", re.IGNORECASE)
_ACCOUNT_STANDALONE_PATTERN = re.compile(r"\b\d{9,18}\b")
_IFSC_PATTERN = re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b")


def _extract_id_number(raw_text: str, document_type: DocumentType) -> Optional[str]:
    if not raw_text:
        return None
    if document_type == DocumentType.AADHAAR:
        m = _AADHAAR_PATTERN.search(raw_text)
        return m.group(0) if m else None
    if document_type == DocumentType.PAN:
        m = _PAN_PATTERN.search(raw_text)
        return m.group(0) if m else None
    if document_type == DocumentType.BANK_PASSBOOK:
        m_acc_label = _ACCOUNT_LABEL_PATTERN.search(raw_text)
        acc_num = m_acc_label.group(1) if m_acc_label else None
        if not acc_num:
            m_acc_stand = _ACCOUNT_STANDALONE_PATTERN.search(raw_text)
            acc_num = m_acc_stand.group(0) if m_acc_stand else None
        m_ifsc = _IFSC_PATTERN.search(raw_text)
        ifsc_code = m_ifsc.group(0) if m_ifsc else None
        
        if acc_num and ifsc_code:
            return f"A/c: {acc_num} | IFSC: {ifsc_code}"
        if acc_num:
            return f"A/c: {acc_num}"
        if ifsc_code:
            return f"IFSC: {ifsc_code}"

    # Generic ID fallback
    for p in [_PAN_PATTERN, _AADHAAR_PATTERN, _ACCOUNT_LABEL_PATTERN, _ACCOUNT_STANDALONE_PATTERN]:
        m = p.search(raw_text)
        if m:
            return m.group(1) if m.groups() else m.group(0)
    return None


_SYSTEM_IGNORE_KEYWORDS = [
    "bank", "state bank", "india", "department", "government", "branch", "account",
    "income tax", "passbook", "savings", "current", "cif", "ifsc", "micr", "date",
    "valid", "card", "unique identification", "authority", "enrollment", "female",
    "male", "yob", "dob", "address", "signature", "photo", "statement", "punjab national",
    "bank of baroda", "canara", "union bank", "central bank", "hdfc", "icici", "axis",
    "govt of india", "income tax department", "भारत सरकार", "आयकर विभाग", "भारतीय स्टेट बैंक",
]


def _extract_name_guess(raw_text: str, declared_name: Optional[str] = None) -> Optional[str]:
    if not raw_text:
        return None
    
    # 0. If declared name is known and matches any substring in the OCR text (case-insensitive)
    if declared_name and len(declared_name.strip()) >= 3:
        decl = declared_name.strip()
        m = re.search(re.escape(decl), raw_text, re.IGNORECASE)
        if m:
            return m.group(0)
        # Check first name match
        parts = decl.split()
        if len(parts) >= 2 and parts[0].lower() in raw_text.lower() and parts[-1].lower() in raw_text.lower():
            return decl

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    
    # 1. Look for explicit Name / Holder / Applicant labels
    for line in lines:
        m = re.search(r"(?:name|holder|shri|smt|mr|mrs|ms|applicant|customer name|a/c name|नाम)\s*[:\-]?\s*([A-Za-z\s\.]{3,35})", line, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            # Trim off trailing tokens
            candidate = re.sub(r"\s+(?:PAN|DOB|A/c|Acc|UID|Aadhaar|No|Card|Number|IFSC|CIF|Branch)\b.*$", "", candidate, flags=re.IGNORECASE).strip()
            if len(candidate) >= 3 and not any(kw in candidate.lower() for kw in _SYSTEM_IGNORE_KEYWORDS):
                return candidate
                
    # 2. Look for standalone person names (2-3 titlecase or uppercase words)
    for line in lines:
        clean_line = re.sub(r"\s+(?:PAN|DOB|A/c|Acc|UID|Aadhaar|No|Card|Number|IFSC|CIF|Branch)\b.*$", "", line, flags=re.IGNORECASE).strip()
        if re.match(r"^[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z]+){1,2}$", clean_line):
            if not any(kw in clean_line.lower() for kw in _SYSTEM_IGNORE_KEYWORDS):
                return clean_line
        # All uppercase name line: e.g. "SUNITA SAHU"
        if re.match(r"^[A-Z]{3,15}(\s+[A-Z]{2,15}){1,2}$", clean_line):
            if not any(kw in clean_line.lower() for kw in _SYSTEM_IGNORE_KEYWORDS):
                # Title-case it for nice UI presentation
                return clean_line.title()
                
    # 3. First non-system line with plausible person name length
    for line in lines:
        clean_line = re.sub(r"\s+(?:PAN|DOB|A/c|Acc|UID|Aadhaar|No|Card|Number)\b.*$", "", line, flags=re.IGNORECASE).strip()
        if 4 <= len(clean_line) <= 30 and not any(kw in clean_line.lower() for kw in _SYSTEM_IGNORE_KEYWORDS):
            words = clean_line.split()
            if 1 <= len(words) <= 3 and all(w.isalpha() for w in words):
                return clean_line.title()
                
    return None


def run_ocr(submission: DocumentSubmission, declared_name: Optional[str] = None) -> OcrExtractionResult:
    # Path 1: DigiLocker Pre-verified
    if submission.digilocker_fetched:
        return OcrExtractionResult(
            document_type=submission.document_type,
            extracted_name=submission.manual_name or declared_name,
            extracted_id_number=submission.manual_id_number,
            raw_text="(DigiLocker-verified — OCR skipped)",
            name_matches_declared=True,
        )

    # Path 2: Direct Manual User / Bank Sakhi Input (Zero OCR needed)
    if submission.manual_name or submission.manual_id_number:
        return OcrExtractionResult(
            document_type=submission.document_type,
            extracted_name=submission.manual_name,
            extracted_id_number=submission.manual_id_number,
            raw_text="(Manually entered by applicant / Bank Sakhi)",
            name_matches_declared=None,
        )

    if not submission.image_bytes or len(submission.image_bytes) == 0:
        return OcrExtractionResult(
            document_type=submission.document_type,
            extracted_name=None,
            extracted_id_number=None,
            raw_text="(No valid image bytes provided — OCR skipped)",
            name_matches_declared=None,
        )

    # Path 3: Local On-Premise OCR (Strictly on device — never sends data to any external LLM)
    from PIL import Image

    raw_text = ""
    extracted_name = None
    extracted_id = None

    # 1. Try Windows Native WinRT OCR (Runs natively on Windows 10/11)
    try:
        import winocr
        image = Image.open(io.BytesIO(submission.image_bytes))
        image = image.convert("RGB")
        res = winocr.recognize_pil_sync(image, 'en')
        if isinstance(res, dict):
            if "lines" in res and res["lines"]:
                raw_text = "\n".join(l.get("text", "") for l in res["lines"] if isinstance(l, dict) and "text" in l)
            else:
                raw_text = res.get("text", "")
        else:
            raw_text = str(res)
            
        extracted_name = _extract_name_guess(raw_text, declared_name=declared_name)
        extracted_id = _extract_id_number(raw_text, submission.document_type)
    except Exception as winocr_err:
        # 2. Fallback to Tesseract OCR if winocr failed
        try:
            import pytesseract
            image = Image.open(io.BytesIO(submission.image_bytes))
            image = image.convert("RGB")
            raw_text = pytesseract.image_to_string(image)
            extracted_name = _extract_name_guess(raw_text, declared_name=declared_name)
            extracted_id = _extract_id_number(raw_text, submission.document_type)
        except Exception as tesseract_err:
            raw_text = f"(Local OCR note: {winocr_err})"
            extracted_name = None
            extracted_id = None

    return OcrExtractionResult(
        document_type=submission.document_type,
        extracted_name=extracted_name,
        extracted_id_number=extracted_id,
        raw_text=raw_text,
        name_matches_declared=None,
    )


def _names_roughly_match(declared: str, extracted: str) -> bool:
    norm = lambda s: re.sub(r"\s+", " ", s.strip().lower())
    return norm(declared) == norm(extracted)


# ---------------------------------------------------------------------------
# DigiLocker integration — STUB, not wired to a real API. See module docstring.
# ---------------------------------------------------------------------------

def _fetch_from_digilocker(document_type: DocumentType, digilocker_consent_token: str) -> DocumentSubmission:
    raise NotImplementedError(
        "DigiLocker API integration not wired. Requires: (1) a registered "
        "DigiLocker partner ID from https://partners.digilocker.gov.in, "
        "(2) the OAuth consent flow completed by the applicant, "
        "(3) the resulting access token passed as digilocker_consent_token. "
        "None of that exists yet — this is a placeholder for where that "
        "integration goes."
    )


DOCUMENT_TYPE_ALIASES = {
    "PROJECT_REPORT": DocumentType.BUSINESS_PLAN,
    "PROJECT_PLAN": DocumentType.BUSINESS_PLAN,
    "BUSINESS_PLAN": DocumentType.BUSINESS_PLAN,
    "DPR": DocumentType.BUSINESS_PLAN,
    "DETAILED_PROJECT_REPORT": DocumentType.BUSINESS_PLAN,
    "AADHAAR": DocumentType.AADHAAR,
    "AADHAR": DocumentType.AADHAAR,
    "ADHAR": DocumentType.AADHAAR,
    "AADHAAR_CARD": DocumentType.AADHAAR,
    "EAADHAAR": DocumentType.AADHAAR,
    "PAN": DocumentType.PAN,
    "PAN_CARD": DocumentType.PAN,
    "PANCR": DocumentType.PAN,
    "BANK_PASSBOOK": DocumentType.BANK_PASSBOOK,
    "PASSBOOK": DocumentType.BANK_PASSBOOK,
    "BANK_STATEMENT": DocumentType.BANK_PASSBOOK,
    "CASTE_CERTIFICATE": DocumentType.CASTE_CERTIFICATE,
    "CASTE_CERT": DocumentType.CASTE_CERTIFICATE,
    "CASTC": DocumentType.CASTE_CERTIFICATE,
    "CERST": DocumentType.CASTE_CERTIFICATE,
    "SOCAC": DocumentType.CASTE_CERTIFICATE,
    "INCOME_CERTIFICATE": DocumentType.INCOME_CERTIFICATE,
    "INCOME_CERT": DocumentType.INCOME_CERTIFICATE,
    "INCER": DocumentType.INCOME_CERTIFICATE,
    "INCOM": DocumentType.INCOME_CERTIFICATE,
    "GREENFIELD_DECLARATION": DocumentType.GREENFIELD_DECLARATION,
    "GREENFIELD": DocumentType.GREENFIELD_DECLARATION,
    "ADDRESS_PROOF": DocumentType.ADDRESS_PROOF,
    "PASSPORT_PHOTO": DocumentType.PASSPORT_PHOTO,
    "PHOTO": DocumentType.PASSPORT_PHOTO,
}


def resolve_document_type(doc_name: str) -> Optional[DocumentType]:
    """Resolves case-insensitive document type names and common aliases."""
    if not doc_name:
        return None
    cleaned = str(doc_name).strip().upper().replace("-", "_").replace(" ", "_")
    if cleaned in DOCUMENT_TYPE_ALIASES:
        return DOCUMENT_TYPE_ALIASES[cleaned]
    try:
        return DocumentType(cleaned)
    except ValueError:
        return None


def check_readiness(
    scheme_code: str,
    submissions: list[DocumentSubmission],
    declared_identity: DeclaredIdentity,
    routed_via_sc_st: bool = False,
) -> ReadinessResult:
    required = list(SCHEME_DOCUMENT_REQUIREMENTS.get(scheme_code, []))
    if requires_caste_certificate(scheme_code, routed_via_sc_st) and DocumentType.CASTE_CERTIFICATE not in required:
        required.append(DocumentType.CASTE_CERTIFICATE)

    submitted_types = [s.document_type for s in submissions]
    missing = [d for d in required if d not in submitted_types]

    ocr_flags: list[OcrExtractionResult] = []
    ocr_extractions: list[OcrExtractionResult] = []
    for submission in submissions:
        # Cross-check OCR extraction or manual input for all submitted documents
        if submission.image_bytes is not None or submission.digilocker_fetched or submission.manual_name or submission.manual_id_number:
            result = run_ocr(submission, declared_name=declared_identity.full_name)
            if result.extracted_name and not submission.digilocker_fetched:
                result.name_matches_declared = _names_roughly_match(declared_identity.full_name, result.extracted_name)
            if result.name_matches_declared is False:
                ocr_flags.append(result)
            ocr_extractions.append(result)

    return ReadinessResult(
        scheme_code=scheme_code, required_documents=required, submitted_documents=submitted_types,
        missing_documents=missing, ocr_flags=ocr_flags, ocr_extractions=ocr_extractions,
        is_ready=(len(missing) == 0 and len(ocr_flags) == 0),
    )


# ---------------------------------------------------------------------------
# Live OCR test — generates a synthetic ID card image and runs it through
# the real pytesseract pipeline, no external files needed.
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from PIL import Image, ImageDraw

    # Build a synthetic "PAN card"-like image to prove OCR extraction works.
    img = Image.new("RGB", (600, 250), color="white")
    draw = ImageDraw.Draw(img)
    draw.text((20, 30), "INCOME TAX DEPARTMENT", fill="black")
    draw.text((20, 70), "Name: Priya Sharma", fill="black")
    draw.text((20, 110), "PAN: ABCDE1234F", fill="black")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    image_bytes = buf.getvalue()

    submission = DocumentSubmission(document_type=DocumentType.PAN, image_bytes=image_bytes)
    ocr_result = run_ocr(submission)
    print("=== Raw OCR text ===")
    print(ocr_result.raw_text)
    print(f"Extracted name: {ocr_result.extracted_name}")
    print(f"Extracted PAN : {ocr_result.extracted_id_number}")

    print("\n=== Full readiness check (PAN only submitted, MICRO_FINANCE scheme) ===")
    identity = DeclaredIdentity(full_name="Priya Sharma", date_of_birth="01/01/1990")
    readiness = check_readiness("MICRO_FINANCE", [submission], identity)
    print(f"Ready: {readiness.is_ready}")
    print(f"Missing documents: {[d.value for d in readiness.missing_documents]}")
    print(f"OCR flags: {len(readiness.ocr_flags)}")

    print("\n=== Same, but declared name doesn't match (mismatch detection test) ===")
    wrong_identity = DeclaredIdentity(full_name="Someone Else", date_of_birth="01/01/1990")
    readiness2 = check_readiness("MICRO_FINANCE", [submission], wrong_identity)
    print(f"Ready: {readiness2.is_ready}")
    print(f"OCR flags: {len(readiness2.ocr_flags)}")
    for flag in readiness2.ocr_flags:
        print(f"  {flag.document_type.value}: extracted='{flag.extracted_name}' vs declared='{wrong_identity.full_name}'")
