"""
sample_data/run_tests.py
Automated test suite verifying the Sahay-AI API against sample data payloads.
Run locally with: python sample_data/run_tests.py [http://localhost:8000]
"""

import sys
import json
import requests

DEFAULT_BASE_URL = "http://localhost:8000"

def test_api(base_url: str = DEFAULT_BASE_URL):
    print(f"Testing Sahay-AI API at: {base_url}\n" + "=" * 60)
    session = requests.Session()
    success_count = 0
    total_count = 0

    def run_case(name: str, method: str, path: str, payload=None, expected_status=200):
        nonlocal success_count, total_count
        total_count += 1
        url = f"{base_url}{path}"
        try:
            if method.upper() == "GET":
                resp = session.get(url, timeout=10)
            else:
                resp = session.post(url, json=payload, timeout=15)
            
            if resp.status_code == expected_status:
                print(f"[PASS] {name} (Status: {resp.status_code})")
                success_count += 1
                return resp.json() if resp.text else {}
            else:
                print(f"[FAIL] {name} - Expected {expected_status}, got {resp.status_code}")
                print(f"       Response: {resp.text[:300]}")
                return None
        except Exception as e:
            print(f"[ERROR] {name} - Request failed: {e}")
            return None

    # 1. Health check
    run_case("1. Health Check", "GET", "/health")

    # 2. Scheme Matching
    match_payload = {
        "available_margin": 14000.0,
        "is_women_entrepreneur": True,
        "is_sc_st": True,
        "is_greenfield": True,
        "annual_family_income": 220000.0,
        "is_rural": True,
        "trade_category": "tailor",
        "language": "hi"
    }
    offers = run_case("2. Scheme Match (Rural SC/ST Woman)", "POST", "/api/schemes/match", match_payload)
    if offers:
        top_scheme = offers[0].get("scheme_code")
        print(f"       -> Top Matched Scheme: {top_scheme} ({offers[0].get('scheme_name')})")
        print(f"       -> Effective Rate: {offers[0].get('effective_interest_rate') * 100}%")

    # 3. EMI Calculation
    emi_resp = run_case("3. EMI Schedule Calculation", "POST", "/api/schemes/match/NSFDC_MAHILA_SAMRIDHI/emi", match_payload)
    if emi_resp:
        q_emi = emi_resp.get("quarterly_emi")
        rural_m = emi_resp.get("rural_metrics", {})
        print(f"       -> Quarterly EMI: Rs. {q_emi:,.2f}")
        print(f"       -> Daily Cost Analogy: {rural_m.get('daily_cost')} ({rural_m.get('daily_analogy')})")

    # 4. DigiLocker PKCE Authorize
    auth_resp = run_case("4. DigiLocker PKCE Authorize URL", "GET", "/api/schemes/digilocker/authorize")
    if auth_resp:
        print(f"       -> Auth URL generated with PKCE challenge: {auth_resp.get('auth_url')[:60]}...")

    # 5. Document Readiness Check
    readiness_payload = {
        "scheme_code": "NSFDC_MAHILA_SAMRIDHI",
        "applicant_full_name": "Priya Sharma",
        "applicant_date_of_birth": "1992-08-15",
        "is_sc_st": True,
        "digilocker_verified_documents": {
            "aadhaar": True,
            "pan": True,
            "caste_certificate": True,
            "income_certificate": True
        },
        "submitted_documents": [
            {
                "document_type": "BANK_PASSBOOK",
                "manual_name": "Priya Sharma",
                "manual_id_number": "SBI-62881923"
            },
            {
                "document_type": "ADDRESS_PROOF",
                "manual_name": "Priya Sharma"
            },
            {
                "document_type": "PASSPORT_PHOTO",
                "manual_name": "Priya Sharma"
            }
        ]
    }
    readiness_res = run_case("5. Document Readiness Check", "POST", "/api/schemes/document-readiness", readiness_payload)
    if readiness_res:
        print(f"       -> Is Ready: {readiness_res.get('is_ready')}")
        print(f"       -> Missing Docs: {readiness_res.get('missing_documents')}")

    # 6. Feasibility & SWOT
    feasibility_payload = {
        "block_name": "patan",
        "latitude": 21.0366,
        "longitude": 81.5369,
        "trade_category": "tailor",
        "radius_meters": 5000,
        "language": "hi"
    }
    feasibility_res = run_case("6. Hyper-Local Feasibility (Patan Block)", "POST", "/api/advisory/feasibility", feasibility_payload)
    if feasibility_res:
        print(f"       -> Competitors Found: {feasibility_res.get('competitor_count')}")
        print(f"       -> Demographics: {feasibility_res.get('demographics', {}).get('district')} district")

    # 7. Full Advisory Report Pipeline
    full_payload = {
        **feasibility_payload,
        **match_payload,
        "applicant_full_name": "Priya Sharma",
        "applicant_date_of_birth": "1992-08-15"
    }
    full_res = run_case("7. End-to-End Advisory Report", "POST", "/api/advisory/full-report", full_payload)
    if full_res:
        routed = full_res.get("routed_partner", {})
        print(f"       -> Allocated Branch: {routed.get('branch_name')} ({routed.get('distance_km')} km away)")

    print("=" * 60)
    print(f"Test Summary: {success_count}/{total_count} Passed.")
    return success_count == total_count

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_BASE_URL
    test_api(url)
