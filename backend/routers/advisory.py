"""
routers/advisory.py
Endpoints for the business-advisor journey — hyper-local feasibility/SWOT
(Engine 1), plus a combined full-report endpoint that chains all three
engines into the end-to-end user journey: feasibility -> scheme match ->
partner routing. This is the "companion" data flow your frontend's
/business-advisor and /companion routes both draw from.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from engine.feasibility import LocationInput, generate_feasibility_report
from engine.finance import Applicant, match_schemes, enrich_rural_emi_metrics
from engine.spatial import route_application_in_memory
from engine.document_readiness import (
    DeclaredIdentity,
    DocumentSubmission,
    DocumentType,
    check_readiness,
    resolve_document_type,
)
import base64

router = APIRouter(prefix="/api/advisory", tags=["advisory"])


class FeasibilityRequest(BaseModel):
    block_name: str
    latitude: float = 21.0366
    longitude: float = 81.5369
    trade_category: str
    radius_meters: int = 5000
    language: str = "hi"  # "en", "hi", "mr", "ta"


class FeasibilityResponse(BaseModel):
    block_name: str
    demographics: dict
    competitor_count: int
    competitor_density_is_live: bool
    swot: dict
    opportunity_analysis: str
    pricing_guidance: str
    threats: list[str]
    audio_script: str
    language: str = "hi"


@router.post("/feasibility", response_model=FeasibilityResponse)
def get_feasibility_report(request: FeasibilityRequest):
    """
    Module 1 endpoint: hyper-local feasibility + SWOT, grounded in
    Census demographics and live OSM competitor density.
    Supports English, Hindi, Marathi, and Tamil.
    """
    location = LocationInput(
        block_name=request.block_name, latitude=request.latitude,
        longitude=request.longitude, trade_category=request.trade_category,
    )
    try:
        report = generate_feasibility_report(
            location, request.radius_meters, language=request.language
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotImplementedError as e:
        raise HTTPException(status_code=503, detail=f"LLM client not configured: {e}")

    return FeasibilityResponse(
        block_name=report.block_name,
        demographics=report.demographics,
        competitor_count=report.competitor_density.competitor_count,
        competitor_density_is_live=report.competitor_density.is_live,
        swot=report.swot,
        opportunity_analysis=report.opportunity_analysis,
        pricing_guidance=report.pricing_guidance,
        threats=report.threats,
        audio_script=report.audio_script,
        language=report.language,
    )


class DocumentSubmissionRequest(BaseModel):
    document_type: str                   # must match a DocumentType enum or alias
    image_base64: str | None = None      # required unless digilocker_fetched
    digilocker_fetched: bool = False


class FullReportRequest(BaseModel):
    block_name: str
    latitude: float = 21.0366
    longitude: float = 81.5369
    trade_category: str
    available_margin: float = Field(..., gt=0)
    is_women_entrepreneur: bool = False
    is_sc_st: bool = False
    is_greenfield: bool = True
    annual_family_income: float | None = None
    is_rural: bool = True
    language: str = "hi"  # "en", "hi", "mr", "ta"

    # Document readiness inputs — all optional.
    applicant_full_name: str | None = None
    applicant_date_of_birth: str | None = None
    submitted_documents: list[DocumentSubmissionRequest] = Field(default_factory=list)


class DocumentReadinessResponse(BaseModel):
    is_ready: bool
    required_documents: list[str]
    missing_documents: list[str]
    ocr_mismatch_count: int
    ocr_mismatch_details: list[dict]


class FullReportResponse(BaseModel):
    feasibility: FeasibilityResponse
    best_scheme: dict
    all_matched_schemes: list[dict]
    routed_partner: dict | None
    routing_bypassed_log: list[dict]
    document_readiness: DocumentReadinessResponse | None
    rural_metrics: dict
    audio_script: str
    language: str


@router.post("/full-report", response_model=FullReportResponse)
def get_full_advisory_report(request: FullReportRequest):
    """
    The complete Sahay-AI journey in one call: Engine 1 feasibility ->
    Engine 2 scheme match (best offer selected) -> Engine 3 partner
    routing for that scheme and loan amount. Mirrors the architecture's
    "engines hand off data to each other" description.
    """
    # --- Engine 1 ---
    location = LocationInput(
        block_name=request.block_name, latitude=request.latitude,
        longitude=request.longitude, trade_category=request.trade_category,
    )
    try:
        feasibility_report = generate_feasibility_report(location, language=request.language)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Feasibility step failed: {e}")
    except NotImplementedError as e:
        raise HTTPException(status_code=503, detail=f"LLM client not configured: {e}")

    feasibility_response = FeasibilityResponse(
        block_name=feasibility_report.block_name,
        demographics=feasibility_report.demographics,
        competitor_count=feasibility_report.competitor_density.competitor_count,
        competitor_density_is_live=feasibility_report.competitor_density.is_live,
        swot=feasibility_report.swot,
        opportunity_analysis=feasibility_report.opportunity_analysis,
        pricing_guidance=feasibility_report.pricing_guidance,
        threats=feasibility_report.threats,
        audio_script=feasibility_report.audio_script,
        language=feasibility_report.language,
    )

    # --- Engine 2 ---
    applicant = Applicant(
        available_margin=request.available_margin,
        is_women_entrepreneur=request.is_women_entrepreneur,
        is_sc_st=request.is_sc_st,
        is_greenfield=request.is_greenfield,
        annual_family_income=request.annual_family_income,
        is_rural=request.is_rural,
    )
    try:
        scheme_offers = match_schemes(applicant)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Scheme matching step failed: {e}")

    best_scheme = scheme_offers[0]  # already ranked lowest APR / longest moratorium
    best_emi_calc = enrich_rural_emi_metrics(
        quarterly_emi=(best_scheme.loan_amount * (best_scheme.effective_interest_rate / 4) * (1 + best_scheme.effective_interest_rate / 4)**(best_scheme.tenure_years*4 - round(best_scheme.moratorium_months/3))) / (((1 + best_scheme.effective_interest_rate / 4)**(best_scheme.tenure_years*4 - round(best_scheme.moratorium_months/3))) - 1),
        moratorium_months=best_scheme.moratorium_months,
        trade_category=request.trade_category,
        language=request.language,
    )

    # --- Engine 3 ---
    # NOTE: uses the in-memory routing path since this repo's seed data is
    # still a small placeholder set (see engine/spatial.py). Swap to
    # route_application() (real PostGIS) once DATABASE_URL is wired and
    # seeded with verified branch data.
    routing_result = route_application_in_memory(
        applicant_lat=request.latitude, applicant_lon=request.longitude,
        scheme_code=best_scheme.scheme_code, loan_amount=best_scheme.loan_amount,
    )

    # --- Document Readiness Checker (parallel branch, feeds into Engine 3) ---
    document_readiness_response = None
    if request.submitted_documents and request.applicant_full_name and request.applicant_date_of_birth:
        submissions = []
        for doc_req in request.submitted_documents:
            doc_type = resolve_document_type(doc_req.document_type)
            if doc_type is None:
                raise HTTPException(status_code=400, detail=f"Unknown document_type '{doc_req.document_type}'")

            image_bytes = None
            if doc_req.image_base64:
                try:
                    image_bytes = base64.b64decode(doc_req.image_base64)
                except Exception:
                    raise HTTPException(status_code=400, detail=f"Invalid base64 for {doc_req.document_type}")

            submissions.append(DocumentSubmission(
                document_type=doc_type, image_bytes=image_bytes,
                digilocker_fetched=doc_req.digilocker_fetched,
            ))

        identity = DeclaredIdentity(
            full_name=request.applicant_full_name, date_of_birth=request.applicant_date_of_birth,
        )
        readiness = check_readiness(
            scheme_code=best_scheme.scheme_code, submissions=submissions,
            declared_identity=identity, routed_via_sc_st=request.is_sc_st,
        )
        document_readiness_response = DocumentReadinessResponse(
            is_ready=readiness.is_ready,
            required_documents=[d.value for d in readiness.required_documents],
            missing_documents=[d.value for d in readiness.missing_documents],
            ocr_mismatch_count=len(readiness.ocr_flags),
            ocr_mismatch_details=[
                {"document_type": f.document_type.value, "extracted_name": f.extracted_name}
                for f in readiness.ocr_flags
            ],
        )

    routed_partner = None
    if routing_result.allocated_partner:
        p = routing_result.allocated_partner
        routing_explanation = p.routing_explanation
        if document_readiness_response is not None and not document_readiness_response.is_ready:
            routing_explanation += (
                f" NOTE: application not yet submission-ready — "
                f"{len(document_readiness_response.missing_documents)} document(s) still missing."
            )
        routed_partner = {
            "branch_name": p.branch_name, "institution_name": p.institution_name,
            "institution_type": p.institution_type, "ifsc_code": p.ifsc_code,
            "distance_km": p.distance_km, "fund_quota_remaining": p.fund_quota_remaining,
            "routing_explanation": routing_explanation,
        }

    return FullReportResponse(
        feasibility=feasibility_response,
        best_scheme={
            "scheme_code": best_scheme.scheme_code, "scheme_name": best_scheme.scheme_name,
            "effective_interest_rate": best_scheme.effective_interest_rate,
            "loan_amount": best_scheme.loan_amount, "tenure_years": best_scheme.tenure_years,
            "project_cost": best_scheme.project_cost, "margin_required": best_scheme.margin_required,
            "moratorium_months": best_scheme.moratorium_months,
            "rebates_applied": best_scheme.rebates_applied,
        },
        all_matched_schemes=[
            {"scheme_code": o.scheme_code, "scheme_name": o.scheme_name,
             "effective_interest_rate": o.effective_interest_rate, "loan_amount": o.loan_amount}
            for o in scheme_offers
        ],
        routed_partner=routed_partner,
        routing_bypassed_log=routing_result.bypassed_branches_audit,
        document_readiness=document_readiness_response,
        rural_metrics=best_emi_calc,
        audio_script=feasibility_report.audio_script,
        language=request.language,
    )
