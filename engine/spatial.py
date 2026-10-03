"""
engine/spatial.py
Sahay-AI — Engine 3: Channel Partner Spatial Router (PostGIS)

Canonical Scheme Tokens — these MUST exactly match the scheme_code values
Engine 2 (finance.py) actually returns from match_schemes(). Verified by
direct comparison against finance.py's AFFIRMATIVE_SCHEMES list:
  - 'MICRO_FINANCE'             (general tier, from finance.py's SchemeTier)
  - 'TERM_LOAN'                 (general tier, from finance.py's SchemeTier)
  - 'PMMY_MAHILA_UDYAMI'        (finance.py AffirmativeScheme.code)
  - 'STAND_UP_INDIA_WOMEN'      (finance.py AffirmativeScheme.code)
  - 'NSFDC_MAHILA_SAMRIDHI'     (finance.py AffirmativeScheme.code)

Branch/IFSC data below is UNVERIFIED — see the accompanying chat response.
Do not present these IFSC codes as confirmed-real until checked against
RBI's own IFSC lookup or each bank's official branch locator.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
import math
import os


# ---------------------------------------------------------------------------
# PostGIS Schema & Spatial SQL Queries
# ---------------------------------------------------------------------------

SCHEMA_SQL = """
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS channel_partners (
    id                   SERIAL PRIMARY KEY,
    branch_name          TEXT NOT NULL,
    institution_name     TEXT NOT NULL,
    institution_type     TEXT NOT NULL CHECK (institution_type IN ('SCA', 'PSB', 'RRB', 'NBFC_MFI')),
    ifsc_code            TEXT,
    district             TEXT NOT NULL,
    block                TEXT NOT NULL,
    location             GEOGRAPHY(POINT, 4326) NOT NULL,
    serves_scheme_codes  TEXT[] NOT NULL,
    fund_quota_remaining NUMERIC NOT NULL DEFAULT 0,
    is_solvent           BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channel_partners_location
    ON channel_partners USING GIST (location);
"""

FIND_NEAREST_ELIGIBLE_SQL = """
SELECT
    id, branch_name, institution_name, institution_type, ifsc_code,
    district, block, fund_quota_remaining, is_solvent,
    ST_Distance(location, ST_MakePoint(%(lon)s, %(lat)s)::geography) AS distance_meters
FROM channel_partners
WHERE
    %(scheme_code)s = ANY(serves_scheme_codes)
    AND is_solvent = TRUE
    AND fund_quota_remaining >= %(loan_amount)s
ORDER BY distance_meters ASC
LIMIT %(limit)s;
"""

TOGGLE_BRANCH_STATUS_SQL = """
UPDATE channel_partners
SET is_solvent = %(is_solvent)s,
    fund_quota_remaining = COALESCE(%(fund_quota_remaining)s, fund_quota_remaining),
    updated_at = now()
WHERE id = %(branch_id)s;
"""


# ---------------------------------------------------------------------------
# Seed Data: Chhattisgarh Pilot Corridor (Durg, Bhilai, Raipur)
#
# UNVERIFIED branch names / IFSC codes / coordinates — cross-check against
# RBI's IFSC lookup before any demo or judge-facing use.
# ---------------------------------------------------------------------------

SEED_BRANCHES: List[Dict[str, Any]] = [
    # --- DURG DISTRICT ---
    {
        "id": 1, "branch_name": "SBI Patan Branch", "institution_name": "State Bank of India",
        "institution_type": "PSB", "ifsc_code": "SBIN0010836",
        "district": "Durg", "block": "Patan", "lat": 21.0366, "lon": 81.5369,
        "serves_scheme_codes": ["MICRO_FINANCE", "TERM_LOAN", "PMMY_MAHILA_UDYAMI", "STAND_UP_INDIA_WOMEN"],
        "fund_quota_remaining": 1_800_000.0, "is_solvent": True,
    },
    {
        "id": 2, "branch_name": "CRGB Patan Branch", "institution_name": "Chhattisgarh Rajya Gramin Bank",
        "institution_type": "RRB", "ifsc_code": "CRGB0008162",
        "district": "Durg", "block": "Patan", "lat": 21.0392, "lon": 81.5398,
        "serves_scheme_codes": ["MICRO_FINANCE", "PMMY_MAHILA_UDYAMI", "NSFDC_MAHILA_SAMRIDHI"],
        "fund_quota_remaining": 650_000.0, "is_solvent": True,
    },
    {
        "id": 3, "branch_name": "SBI Dhamdha Branch", "institution_name": "State Bank of India",
        "institution_type": "PSB", "ifsc_code": "SBIN0010835",
        "district": "Durg", "block": "Dhamdha", "lat": 21.4468, "lon": 81.3142,
        "serves_scheme_codes": ["MICRO_FINANCE", "TERM_LOAN", "PMMY_MAHILA_UDYAMI", "STAND_UP_INDIA_WOMEN"],
        "fund_quota_remaining": 0.0, "is_solvent": True,   # quota exhausted: proves dynamic bypass
    },
    {
        "id": 4, "branch_name": "CRGB Dhamdha Branch", "institution_name": "Chhattisgarh Rajya Gramin Bank",
        "institution_type": "RRB", "ifsc_code": "CRGB0008111",
        "district": "Durg", "block": "Dhamdha", "lat": 21.4421, "lon": 81.3115,
        "serves_scheme_codes": ["MICRO_FINANCE", "PMMY_MAHILA_UDYAMI", "NSFDC_MAHILA_SAMRIDHI"],
        "fund_quota_remaining": 850_000.0, "is_solvent": True,
    },
    {
        "id": 5, "branch_name": "Durg District Antyavasayi Co-op Society",
        "institution_name": "Chhattisgarh State Channelizing Agency (SCA)",
        "institution_type": "SCA", "ifsc_code": None,
        "district": "Durg", "block": "Durg", "lat": 21.1904, "lon": 81.2849,
        "serves_scheme_codes": ["NSFDC_MAHILA_SAMRIDHI", "MICRO_FINANCE", "TERM_LOAN"],
        "fund_quota_remaining": 3_500_000.0, "is_solvent": True,
    },
    {
        "id": 6, "branch_name": "PNB Sector 1 Bhilai", "institution_name": "Punjab National Bank",
        "institution_type": "PSB", "ifsc_code": "PUNB0005700",
        "district": "Durg", "block": "Durg", "lat": 21.2140, "lon": 81.3812,
        "serves_scheme_codes": ["TERM_LOAN", "STAND_UP_INDIA_WOMEN", "PMMY_MAHILA_UDYAMI"],
        "fund_quota_remaining": 4_000_000.0, "is_solvent": False,   # NPA flag: proves solvency filter
    },
    # --- RAIPUR DISTRICT ---
    {
        "id": 7, "branch_name": "SBI Arang Branch", "institution_name": "State Bank of India",
        "institution_type": "PSB", "ifsc_code": "SBIN0010828",
        "district": "Raipur", "block": "Arang", "lat": 21.1965, "lon": 81.9664,
        "serves_scheme_codes": ["MICRO_FINANCE", "TERM_LOAN", "PMMY_MAHILA_UDYAMI", "STAND_UP_INDIA_WOMEN"],
        "fund_quota_remaining": 1_600_000.0, "is_solvent": True,
    },
    {
        "id": 8, "branch_name": "CRGB Arang Branch", "institution_name": "Chhattisgarh Rajya Gramin Bank",
        "institution_type": "RRB", "ifsc_code": "CRGB0008204",
        "district": "Raipur", "block": "Arang", "lat": 21.1980, "lon": 81.9642,
        "serves_scheme_codes": ["MICRO_FINANCE", "PMMY_MAHILA_UDYAMI", "NSFDC_MAHILA_SAMRIDHI"],
        "fund_quota_remaining": 700_000.0, "is_solvent": True,
    },
    {
        "id": 9, "branch_name": "SBI Abhanpur Branch", "institution_name": "State Bank of India",
        "institution_type": "PSB", "ifsc_code": "SBIN0010827",
        "district": "Raipur", "block": "Abhanpur", "lat": 21.0543, "lon": 81.7485,
        "serves_scheme_codes": ["MICRO_FINANCE", "TERM_LOAN", "STAND_UP_INDIA_WOMEN", "PMMY_MAHILA_UDYAMI"],
        "fund_quota_remaining": 2_200_000.0, "is_solvent": True,
    },
    {
        "id": 10, "branch_name": "CRGB Telibandha Branch", "institution_name": "Chhattisgarh Rajya Gramin Bank",
        "institution_type": "RRB", "ifsc_code": "CRGB0000142",
        "district": "Raipur", "block": "Dharsiwa", "lat": 21.2330, "lon": 81.6890,
        "serves_scheme_codes": ["MICRO_FINANCE", "PMMY_MAHILA_UDYAMI", "NSFDC_MAHILA_SAMRIDHI"],
        "fund_quota_remaining": 1_100_000.0, "is_solvent": True,
    },
    {
        "id": 11, "branch_name": "Raipur District Antyavasayi Co-op Society",
        "institution_name": "Chhattisgarh State Channelizing Agency (SCA)",
        "institution_type": "SCA", "ifsc_code": None,
        "district": "Raipur", "block": "Dharsiwa", "lat": 21.2514, "lon": 81.6296,
        "serves_scheme_codes": ["NSFDC_MAHILA_SAMRIDHI", "MICRO_FINANCE", "TERM_LOAN"],
        "fund_quota_remaining": 5_000_000.0, "is_solvent": True,
    },
]


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

@dataclass
class PartnerMatch:
    branch_id: int
    branch_name: str
    institution_name: str
    institution_type: str
    ifsc_code: Optional[str]
    district: str
    block: str
    distance_km: float
    fund_quota_remaining: float
    is_solvent: bool
    routing_status: str
    routing_explanation: str


@dataclass
class RoutingResult:
    applicant_coordinates: Dict[str, float]
    target_scheme_code: str
    requested_loan_amount: float
    allocated_partner: Optional[PartnerMatch]
    backup_partners: List[PartnerMatch] = field(default_factory=list)
    bypassed_branches_audit: List[Dict[str, str]] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Production Route: PostgreSQL + PostGIS
# ---------------------------------------------------------------------------

def route_application(
    applicant_lat: float,
    applicant_lon: float,
    scheme_code: str,
    loan_amount: float,
    limit: int = 3,
) -> RoutingResult:
    import psycopg2
    import psycopg2.extras

    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise ValueError("DATABASE_URL environment variable is missing.")

    with psycopg2.connect(dsn) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                FIND_NEAREST_ELIGIBLE_SQL,
                {"lat": applicant_lat, "lon": applicant_lon, "scheme_code": scheme_code,
                 "loan_amount": loan_amount, "limit": limit},
            )
            rows = cur.fetchall()

    matches = [
        PartnerMatch(
            branch_id=row["id"], branch_name=row["branch_name"], institution_name=row["institution_name"],
            institution_type=row["institution_type"], ifsc_code=row["ifsc_code"],
            district=row["district"], block=row["block"],
            distance_km=round(row["distance_meters"] / 1000.0, 2),
            fund_quota_remaining=float(row["fund_quota_remaining"]), is_solvent=row["is_solvent"],
            routing_status="BACKUP_OPTION", routing_explanation="",
        )
        for row in rows
    ]
    return _package_routing_result(applicant_lat, applicant_lon, scheme_code, loan_amount, matches)


def toggle_branch_status(branch_id: int, is_solvent: bool, fund_quota_remaining: Optional[float] = None) -> None:
    import psycopg2

    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise ValueError("DATABASE_URL environment variable is missing.")

    with psycopg2.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(TOGGLE_BRANCH_STATUS_SQL, {
                "branch_id": branch_id, "is_solvent": is_solvent, "fund_quota_remaining": fund_quota_remaining,
            })
        conn.commit()


# ---------------------------------------------------------------------------
# In-Memory Route (Zero-Dependency Haversine Engine)
# ---------------------------------------------------------------------------

_IN_MEMORY_STATE = [dict(b) for b in SEED_BRANCHES]


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return r * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


def route_application_in_memory(
    applicant_lat: float, applicant_lon: float, scheme_code: str, loan_amount: float, limit: int = 3,
) -> RoutingResult:
    qualified: List[Dict[str, Any]] = []
    bypassed_audit: List[Dict[str, str]] = []

    for branch in _IN_MEMORY_STATE:
        dist = _haversine_km(applicant_lat, applicant_lon, branch["lat"], branch["lon"])
        branch_copy = dict(branch)
        branch_copy["distance_km"] = round(dist, 2)

        if scheme_code not in branch["serves_scheme_codes"]:
            continue

        if not branch["is_solvent"]:
            bypassed_audit.append({
                "branch_name": branch["branch_name"], "distance": f"{branch_copy['distance_km']} km",
                "reason": "Bypassed: High NPA audit flag / institutional recovery freeze.",
            })
            continue

        if branch["fund_quota_remaining"] < loan_amount:
            bypassed_audit.append({
                "branch_name": branch["branch_name"], "distance": f"{branch_copy['distance_km']} km",
                "reason": f"Bypassed: Quota (₹{branch['fund_quota_remaining']:,.0f}) is below requested loan (₹{loan_amount:,.0f}).",
            })
            continue

        qualified.append(branch_copy)

    qualified.sort(key=lambda b: b["distance_km"])

    matches = [
        PartnerMatch(
            branch_id=b["id"], branch_name=b["branch_name"], institution_name=b["institution_name"],
            institution_type=b["institution_type"], ifsc_code=b["ifsc_code"],
            district=b["district"], block=b["block"], distance_km=b["distance_km"],
            fund_quota_remaining=b["fund_quota_remaining"], is_solvent=b["is_solvent"],
            routing_status="BACKUP_OPTION", routing_explanation="",
        )
        for b in qualified[:limit]
    ]

    result = _package_routing_result(applicant_lat, applicant_lon, scheme_code, loan_amount, matches)
    result.bypassed_branches_audit = bypassed_audit
    return result


def toggle_branch_status_in_memory(branch_name: str, is_solvent: bool, fund_quota_remaining: Optional[float] = None) -> None:
    for b in _IN_MEMORY_STATE:
        if b["branch_name"].strip().lower() == branch_name.strip().lower():
            b["is_solvent"] = is_solvent
            if fund_quota_remaining is not None:
                b["fund_quota_remaining"] = fund_quota_remaining
            return
    raise ValueError(f"Branch '{branch_name}' not found in in-memory registry.")


# ---------------------------------------------------------------------------
# Packaging & Annotation
# ---------------------------------------------------------------------------

def _package_routing_result(
    lat: float, lon: float, scheme_code: str, loan_amount: float, matches: List[PartnerMatch],
) -> RoutingResult:
    if not matches:
        return RoutingResult(
            applicant_coordinates={"lat": lat, "lon": lon}, target_scheme_code=scheme_code,
            requested_loan_amount=loan_amount, allocated_partner=None, backup_partners=[],
        )

    primary = matches[0]
    primary.routing_status = "PRIMARY_ALLOCATION"
    primary.routing_explanation = (
        f"Nearest solvent partner ({primary.distance_km} km) with active authorization "
        f"for {scheme_code} and ₹{primary.fund_quota_remaining:,.0f} remaining quota."
    )

    for idx, alt in enumerate(matches[1:], start=1):
        alt.routing_status = "BACKUP_OPTION"
        alt.routing_explanation = (
            f"Alternative #{idx} located {alt.distance_km} km away. Active quota: "
            f"₹{alt.fund_quota_remaining:,.0f}."
        )

    return RoutingResult(
        applicant_coordinates={"lat": lat, "lon": lon}, target_scheme_code=scheme_code,
        requested_loan_amount=loan_amount, allocated_partner=primary, backup_partners=matches[1:],
    )


# ---------------------------------------------------------------------------
# Integration Validation Script
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    test_lat, test_lon = 21.0366, 81.5369  # Patan block centre

    print("TEST 1: Stand-Up India applicant (Engine 2's REAL code: STAND_UP_INDIA_WOMEN)")
    res_su = route_application_in_memory(test_lat, test_lon, "STAND_UP_INDIA_WOMEN", 1_500_000.0)
    if res_su.allocated_partner:
        p = res_su.allocated_partner
        print(f"  Allocated: {p.branch_name} | IFSC: {p.ifsc_code} | {p.distance_km} km | Quota: Rs.{p.fund_quota_remaining:,.0f}")
    else:
        print("  NO ALLOCATION — scheme token mismatch still present!")

    print("\nTEST 2: PMMY applicant (Engine 2's REAL code: PMMY_MAHILA_UDYAMI)")
    res_pmmy = route_application_in_memory(test_lat, test_lon, "PMMY_MAHILA_UDYAMI", 200_000.0)
    if res_pmmy.allocated_partner:
        p = res_pmmy.allocated_partner
        print(f"  Allocated: {p.branch_name} | IFSC: {p.ifsc_code} | {p.distance_km} km | Quota: Rs.{p.fund_quota_remaining:,.0f}")
    else:
        print("  NO ALLOCATION — scheme token mismatch still present!")

    print("\nTEST 3: NSFDC applicant (Engine 2's REAL code: NSFDC_MAHILA_SAMRIDHI)")
    res_nsfdc = route_application_in_memory(test_lat, test_lon, "NSFDC_MAHILA_SAMRIDHI", 100_000.0)
    if res_nsfdc.allocated_partner:
        p = res_nsfdc.allocated_partner
        print(f"  Allocated: {p.branch_name} | IFSC: {p.ifsc_code} | {p.distance_km} km | Quota: Rs.{p.fund_quota_remaining:,.0f}")
    else:
        print("  NO ALLOCATION — scheme token mismatch still present!")

    print("\nTEST 4: Demo toggle — SBI Patan Branch (nearest STAND_UP_INDIA_WOMEN match) goes quota-exhausted")
    toggle_branch_status_in_memory("SBI Patan Branch", is_solvent=True, fund_quota_remaining=0.0)
    res_su2 = route_application_in_memory(test_lat, test_lon, "STAND_UP_INDIA_WOMEN", 1_500_000.0)
    if res_su2.allocated_partner:
        p2 = res_su2.allocated_partner
        print(f"  Re-routed: {p2.branch_name} | {p2.distance_km} km | Quota: Rs.{p2.fund_quota_remaining:,.0f}")
    print("  Bypassed:")
    for b in res_su2.bypassed_branches_audit:
        print(f"    - {b['branch_name']} ({b['distance']}): {b['reason']}")
