"""
engine/finance.py
Sahay-AI — Engine 2: Mathematical Financier & Tier Selector

Given an applicant's available margin capital and category flags, this module:
  1. Computes the feasible Project Cost and Loan Amount using a FIXED 10%
     margin requirement across all tiers and categories (per national
     Mudra / Stand-Up India / MoSJE-SCA guidelines — there is no reduced
     margin slab for women; their benefit is an interest subvention and
     priority ranking instead).
  2. Selects the correct scheme tier (Micro Finance vs. Term Loan) from the
     computed Project Cost.
  3. Applies the three-step precedence/stacking rule to decide the final
     effective interest rate, and returns one or more ranked scheme offers,
     checking each affirmative scheme's real eligibility constraints
     (loan-range, greenfield-only, category, income cap) rather than a
     single boolean flag.
  4. Generates a quarterly EMI schedule factoring in the scheme's moratorium.

No external dependencies — pure logic, safe to unit test in isolation
before Engine 1 (OSM/Census) or Engine 3 (PostGIS) exist.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Callable


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MICRO_FINANCE_MAX_PROJECT_COST = 140_000       # ₹1.40 lakh
TERM_LOAN_MAX_PROJECT_COST = 5_000_000         # ₹50.00 lakh

# Margin requirement is FIXED at 10% for every applicant and every tier.
# Women's and SC/ST's benefit is expressed as interest subvention +
# priority ranking, never as a change to this multiplier.
MARGIN_RATE = 0.10

MICRO_FINANCE_BASE_RATE = 0.065                # 6.5% p.a.
TERM_LOAN_BASE_RATE = 0.08                     # 8.0% p.a.

MICRO_FINANCE_TENURE_YEARS = 3
MICRO_FINANCE_MORATORIUM_MONTHS = 3
TERM_LOAN_TENURE_YEARS = 7
TERM_LOAN_MORATORIUM_MONTHS = 6

WOMEN_SUBVENTION_BPS = 100                     # 1.00%
SC_ST_SUBVENTION_BPS = 50                      # 0.50%
INTEREST_RATE_FLOOR = 0.05                     # hard regulatory floor, 5.0%


class SchemeTier(str, Enum):
    MICRO_FINANCE = "MICRO_FINANCE"
    TERM_LOAN = "TERM_LOAN"


# ---------------------------------------------------------------------------
# Applicant input
# ---------------------------------------------------------------------------

@dataclass
class Applicant:
    available_margin: float                # ₹ the applicant has on hand
    is_women_entrepreneur: bool = False
    is_sc_st: bool = False
    is_greenfield: bool = True             # new enterprise, not an expansion
    annual_family_income: Optional[float] = None   # ₹, needed for NSFDC check
    is_rural: bool = True                  # determines NSFDC income cap variant
    # Extend as needed: state, district, business_category, etc.


# ---------------------------------------------------------------------------
# Affirmative / designated schemes (Step 1 of precedence rule)
#
# Each eligible_fn checks the SCHEME'S OWN real constraints (loan range,
# category, income cap) against the applicant AND the computed project
# cost — not just a demographic flag.
# ---------------------------------------------------------------------------

@dataclass
class AffirmativeScheme:
    code: str
    name: str
    eligible_fn: Callable[["Applicant", float], bool]   # (applicant, loan_amount) -> bool
    interest_rate: float
    tenure_years: int
    moratorium_months: int
    min_loan: Optional[float] = None
    max_loan: Optional[float] = None


def _stand_up_india_eligible(a: Applicant, loan_amount: float) -> bool:
    # Greenfield enterprise only; individual loan ₹10L–₹100L; woman OR SC/ST.
    return (
        a.is_greenfield
        and (a.is_women_entrepreneur or a.is_sc_st)
        and 1_000_000 <= loan_amount <= 10_000_000
    )


def _pmmy_eligible(a: Applicant, loan_amount: float) -> bool:
    # Non-farm micro-enterprise up to ₹10L. No caste restriction.
    # (Shishu/Kishore/Tarun tiering affects the *scheme sub-name* and
    # priority, not eligibility itself — kept as a note for Engine 1/3
    # to surface the correct sub-tier label.)
    return 0 < loan_amount <= 1_000_000


def _nsfdc_mahila_samridhi_eligible(a: Applicant, loan_amount: float) -> bool:
    # Strict SC category + family income cap; micro-credit up to ₹1.40L.
    if not a.is_sc_st or not a.is_women_entrepreneur:
        return False
    if a.annual_family_income is None:
        return False  # can't verify — do not silently assume eligibility
    income_cap = 300_000 if a.is_rural else 350_000
    return a.annual_family_income <= income_cap and loan_amount <= 140_000


AFFIRMATIVE_SCHEMES = [
    AffirmativeScheme(
        code="STAND_UP_INDIA_WOMEN",
        name="Stand-Up India",
        eligible_fn=_stand_up_india_eligible,
        interest_rate=0.07,
        tenure_years=7,
        moratorium_months=6,
        min_loan=1_000_000,
        max_loan=10_000_000,
    ),
    AffirmativeScheme(
        code="PMMY_MAHILA_UDYAMI",
        name="PMMY (Mudra)",
        eligible_fn=_pmmy_eligible,
        interest_rate=0.065,
        tenure_years=5,
        moratorium_months=3,
        max_loan=1_000_000,
    ),
    AffirmativeScheme(
        code="NSFDC_MAHILA_SAMRIDHI",
        name="NSFDC — Mahila Samridhi Yojana",
        eligible_fn=_nsfdc_mahila_samridhi_eligible,
        interest_rate=0.04,
        tenure_years=3,
        moratorium_months=3,
        max_loan=140_000,
    ),
    # NOTE: tenure/moratorium for Stand-Up India and PMMY are still
    # reasonable-default placeholders (real terms vary by lending bank) —
    # the ELIGIBILITY gates above are now the documented real constraints;
    # verify current rates before demo day.
]


# ---------------------------------------------------------------------------
# Result object
# ---------------------------------------------------------------------------

@dataclass
class SchemeOffer:
    scheme_code: str
    scheme_name: str
    project_cost: float
    loan_amount: float
    margin_required: float
    effective_interest_rate: float
    tenure_years: int
    moratorium_months: int
    is_affirmative_scheme: bool
    rebates_applied: list = field(default_factory=list)


# ---------------------------------------------------------------------------
# Step 2 — general tier selection + demographic subvention stacking
# ---------------------------------------------------------------------------

def _select_general_tier(project_cost: float) -> SchemeTier:
    if project_cost <= MICRO_FINANCE_MAX_PROJECT_COST:
        return SchemeTier.MICRO_FINANCE
    if project_cost <= TERM_LOAN_MAX_PROJECT_COST:
        return SchemeTier.TERM_LOAN
    raise ValueError(
        f"Project cost ₹{project_cost:,.0f} exceeds the ₹50 lakh Term Loan "
        "ceiling — outside scope of these two schemes."
    )


def _general_tier_offer(applicant: Applicant, project_cost: float, loan_amount: float) -> SchemeOffer:
    tier = _select_general_tier(project_cost)

    if tier == SchemeTier.MICRO_FINANCE:
        base_rate = MICRO_FINANCE_BASE_RATE
        tenure = MICRO_FINANCE_TENURE_YEARS
        moratorium = MICRO_FINANCE_MORATORIUM_MONTHS
        loan_amount = min(loan_amount, 125_000.0)
        tier_name = "Micro Finance Scheme"
    else:
        base_rate = TERM_LOAN_BASE_RATE
        tenure = TERM_LOAN_TENURE_YEARS
        moratorium = TERM_LOAN_MORATORIUM_MONTHS
        loan_amount = min(loan_amount, 4_500_000.0)
        tier_name = "Term Loan Scheme"

    # Stack demographic subventions on the base rate down to the floor.
    rebate_bps = 0
    rebates_applied = []
    if applicant.is_women_entrepreneur:
        rebate_bps += WOMEN_SUBVENTION_BPS
        rebates_applied.append("women_entrepreneur_rebate_100bps")
    if applicant.is_sc_st:
        rebate_bps += SC_ST_SUBVENTION_BPS
        rebates_applied.append("sc_st_concession_50bps")

    effective_rate = max(INTEREST_RATE_FLOOR, base_rate - rebate_bps / 10_000)

    return SchemeOffer(
        scheme_code=tier.value,
        scheme_name=tier_name,
        project_cost=project_cost,
        loan_amount=loan_amount,
        margin_required=applicant.available_margin,
        effective_interest_rate=effective_rate,
        tenure_years=tenure,
        moratorium_months=moratorium,
        is_affirmative_scheme=False,
        rebates_applied=rebates_applied,
    )


def _affirmative_offer(scheme: AffirmativeScheme, applicant: Applicant,
                        project_cost: float, loan_amount: float) -> SchemeOffer:
    return SchemeOffer(
        scheme_code=scheme.code,
        scheme_name=scheme.name,
        project_cost=project_cost,
        loan_amount=loan_amount,
        margin_required=applicant.available_margin,
        effective_interest_rate=scheme.interest_rate,
        tenure_years=scheme.tenure_years,
        moratorium_months=scheme.moratorium_months,
        is_affirmative_scheme=True,
        rebates_applied=["designated_affirmative_scheme"],
    )


SCHEME_ALIASES = {
    "STAND_UP_INDIA": "STAND_UP_INDIA_WOMEN",
    "STAND_UP_INDIA_WOMEN": "STAND_UP_INDIA_WOMEN",
    "STANDUP_INDIA": "STAND_UP_INDIA_WOMEN",
    "STANDUP": "STAND_UP_INDIA_WOMEN",
    "PMMY": "PMMY_MAHILA_UDYAMI",
    "PMMY_MAHILA_UDYAMI": "PMMY_MAHILA_UDYAMI",
    "MUDRA": "PMMY_MAHILA_UDYAMI",
    "NSFDC": "NSFDC_MAHILA_SAMRIDHI",
    "NSFDC_MAHILA_SAMRIDHI": "NSFDC_MAHILA_SAMRIDHI",
    "MAHILA_SAMRIDHI": "NSFDC_MAHILA_SAMRIDHI",
    "MICRO_FINANCE": "MICRO_FINANCE",
    "MICROFINANCE": "MICRO_FINANCE",
    "TERM_LOAN": "TERM_LOAN",
    "TERMLOAN": "TERM_LOAN",
    "PMEGP": "TERM_LOAN",  # PMEGP maps to Prime Minister Employment Generation Term Loan
}


def resolve_scheme_code(code: str) -> str:
    cleaned = code.strip().upper().replace("-", "_").replace(" ", "_")
    return SCHEME_ALIASES.get(cleaned, cleaned)


def get_scheme_offer_by_code(scheme_code: str, applicant: Applicant) -> Optional[SchemeOffer]:
    """
    Retrieve or compute a scheme offer for a specific canonical or aliased
    scheme code — but ONLY if the applicant actually qualifies for it.

    SECURITY/CORRECTNESS NOTE: this function previously returned a fully
    computed offer (rate, EMI-ready loan amount) for ANY requested scheme
    code, with no eligibility check — meaning an applicant could request
    an EMI schedule for a scheme they don't qualify for (e.g. NSFDC
    without being SC/ST) and receive a legitimate-looking result. For a
    financial product, a false "you qualify" is worse than a 404. This
    function now re-checks eligibility the same way match_schemes() does,
    and returns None (not a silently-wrong offer) if the applicant isn't
    actually eligible for the requested scheme.
    """
    canonical = resolve_scheme_code(scheme_code)
    project_cost = applicant.available_margin / MARGIN_RATE
    loan_amount = project_cost * (1 - MARGIN_RATE)

    for scheme in AFFIRMATIVE_SCHEMES:
        if scheme.code == canonical:
            if not scheme.eligible_fn(applicant, loan_amount):
                return None  # NOT eligible — do not fabricate an offer
            return _affirmative_offer(scheme, applicant, project_cost, loan_amount)

    if canonical in (SchemeTier.MICRO_FINANCE.value, SchemeTier.TERM_LOAN.value):
        actual_tier = _select_general_tier(project_cost)
        if actual_tier.value != canonical:
            # Applicant's project cost doesn't actually land in the
            # requested tier (e.g. asked for MICRO_FINANCE but their
            # margin computes to a Term Loan-sized project) — same
            # principle: don't silently serve the wrong tier's numbers.
            return None
        return _general_tier_offer(applicant, project_cost, loan_amount)

    return None


def match_schemes(applicant: Applicant) -> list[SchemeOffer]:
    """
    Margin rate is fixed at 10% for everyone, so Project Cost and Loan
    Amount are computed once and reused across every scheme check.

    Step 1: Check each affirmative scheme's real eligibility constraints
            against the computed loan amount. Collect all matches (a
            scheme is either eligible or not — no double counting).
    Step 2: Always also compute the general-tier offer with stacked
            demographic subventions, for comparison.
    Step 3: Return all matches ranked by lowest effective APR, then
            longest moratorium.
    """
    project_cost = applicant.available_margin / MARGIN_RATE
    loan_amount = project_cost * (1 - MARGIN_RATE)

    offers: list[SchemeOffer] = []

    for scheme in AFFIRMATIVE_SCHEMES:
        if scheme.eligible_fn(applicant, loan_amount):
            offers.append(_affirmative_offer(scheme, applicant, project_cost, loan_amount))

    offers.append(_general_tier_offer(applicant, project_cost, loan_amount))

    offers.sort(key=lambda o: (o.effective_interest_rate, -o.moratorium_months))
    return offers


# ---------------------------------------------------------------------------
# EMI generator
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Multilingual Rural EMI & Trade Analogies
# ---------------------------------------------------------------------------

TRADE_EARNING_BENCHMARKS = {
    "tailor": {
        "unit_price": 80,
        "en": "custom garments tailored",
        "hi": "सूट सिलने की कमाई",
        "mr": "ड्रेस शिवण्याची कमाई",
        "ta": "துணி தைக்கும் வருமானம்",
    },
    "dairy": {
        "unit_price": 60,
        "en": "litres of milk sold",
        "hi": "लीटर दूध की बिक्री",
        "mr": "लिटर दुधाची विक्री",
        "ta": "லிட்டர் பால் விற்பனை",
    },
    "vegetable_vendor": {
        "unit_price": 50,
        "en": "kg fresh produce sold",
        "hi": "किलो सब्ज़ी की बिक्री",
        "mr": "किलो भाजीपाल्याची विक्री",
        "ta": "கிலோ காய்கறி விற்பனை",
    },
    "retail": {
        "unit_price": 40,
        "en": "customers served at kirana",
        "hi": "किराना ग्राहकों का औसत मुनाफ़ा",
        "mr": "किराणा ग्राहकांचा नफा",
        "ta": "மளிகை வாடிக்கையாளர் லாபம்",
    },
    "beauty_parlour": {
        "unit_price": 120,
        "en": "salon clients serviced",
        "hi": "ग्राहकों की सेवा",
        "mr": "ग्राहकांची सेवा",
        "ta": "வாடிக்கையாளர் சேவை",
    },
    "electronics_repair": {
        "unit_price": 150,
        "en": "devices repaired",
        "hi": "डिवाइस मरम्मत की कमाई",
        "mr": "उपकरण दुरुस्ती कमाई",
        "ta": "சாதன பழுதுபார்ப்பு வருமானம்",
    },
    "welding_fabrication": {
        "unit_price": 250,
        "en": "hours of fabrication work",
        "hi": "घंटे की वेल्डिंग कारीगरी",
        "mr": "वेल्डिंग कामाची मजुरी",
        "ta": "வெல்டிங் வேலை வருமானம்",
    },
    "carpentry": {
        "unit_price": 250,
        "en": "hours of carpentry craft",
        "hi": "घंटे की बढ़ईगीरी कारीगरी",
        "mr": "सुतारकाम मजुरी",
        "ta": "தச்சு வேலை வருமானம்",
    },
}

MORATORIUM_BENEFIT_MESSAGES = {
    "en": "No repayment required for the first {months} months (moratorium period).",
    "hi": "शुरुआती {months} महीने बैंक को कोई किश्त नहीं देनी है (छूट अवधि)।",
    "mr": "सुरुवातीच्या {months} महिन्यांत बँकेला कोणताही हप्ता भरावा लागणार नाही.",
    "ta": "முதல் {months} மாதங்களுக்கு எந்த தவணையும் செலுத்த தேவையில்லை.",
}


def enrich_rural_emi_metrics(
    quarterly_emi: float,
    moratorium_months: int = 3,
    trade_category: str = "tailor",
    language: str = "hi",
) -> dict:
    """Enriches raw quarterly EMI with rural-accessible metrics and localized earning analogies."""
    lang = language.lower() if language in ("en", "hi", "mr", "ta") else "hi"
    monthly_emi = round(quarterly_emi / 3, 2)
    daily_cost = round(monthly_emi / 30, 2)

    benchmark = TRADE_EARNING_BENCHMARKS.get(
        trade_category.lower(),
        {
            "unit_price": 60,
            "en": "units of daily production",
            "hi": "दैनिक कमाई की इकाइयां",
            "mr": "दैनंदिन उत्पादन युनिट्स",
            "ta": "தினசரி உற்பத்தி அலகுகள்",
        },
    )

    units_needed = max(1, round(daily_cost / benchmark["unit_price"]))
    trade_unit_text = benchmark.get(lang, benchmark["en"])

    if lang == "hi":
        analogy = f"रोज का लगभग ₹{daily_cost:,.0f} (लगभग {units_needed} {trade_unit_text})"
    elif lang == "mr":
        analogy = f"दररोजचे सुमारे ₹{daily_cost:,.0f} (सुमारे {units_needed} {trade_unit_text})"
    elif lang == "ta":
        analogy = f"தினசரி சுமார் ₹{daily_cost:,.0f} (சுமார் {units_needed} {trade_unit_text})"
    else:
        analogy = f"Approx ₹{daily_cost:,.0f}/day (equivalent to ~{units_needed} {trade_unit_text})"

    moratorium_msg = MORATORIUM_BENEFIT_MESSAGES.get(lang, MORATORIUM_BENEFIT_MESSAGES["en"]).format(
        months=moratorium_months
    )

    return {
        "monthly_emi": monthly_emi,
        "daily_cost": daily_cost,
        "units_needed": units_needed,
        "unit_description": trade_unit_text,
        "daily_analogy": analogy,
        "moratorium_benefit": moratorium_msg,
    }


# ---------------------------------------------------------------------------
# EMI generator
# ---------------------------------------------------------------------------

def generate_emi_schedule(
    offer: SchemeOffer,
    trade_category: str = "tailor",
    language: str = "hi",
) -> dict:
    """
    Standard reducing-balance EMI, repayment starting after the moratorium,
    expressed as a quarterly schedule and enriched with rural daily metrics.
    """
    principal = offer.loan_amount
    annual_rate = offer.effective_interest_rate
    quarterly_rate = annual_rate / 4
    total_quarters = offer.tenure_years * 4
    moratorium_quarters = round(offer.moratorium_months / 3)
    repayment_quarters = total_quarters - moratorium_quarters

    if repayment_quarters <= 0:
        raise ValueError("Moratorium period leaves no quarters for repayment.")

    if quarterly_rate == 0:
        quarterly_emi = principal / repayment_quarters
    else:
        r = quarterly_rate
        n = repayment_quarters
        quarterly_emi = principal * r * (1 + r) ** n / ((1 + r) ** n - 1)

    rural_metrics = enrich_rural_emi_metrics(
        quarterly_emi=quarterly_emi,
        moratorium_months=offer.moratorium_months,
        trade_category=trade_category,
        language=language,
    )

    return {
        "scheme_code": offer.scheme_code,
        "principal": round(principal, 2),
        "annual_interest_rate": annual_rate,
        "moratorium_quarters": moratorium_quarters,
        "repayment_quarters": repayment_quarters,
        "quarterly_emi": round(quarterly_emi, 2),
        "total_repayment": round(quarterly_emi * repayment_quarters, 2),
        "rural_metrics": rural_metrics,
    }


# ---------------------------------------------------------------------------
# Quick manual sanity checks
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== Case 1: Woman, SC/ST, ₹1L margin, income ₹2.5L (rural) ===")
    a1 = Applicant(available_margin=100_000, is_women_entrepreneur=True,
                    is_sc_st=True, annual_family_income=250_000, is_rural=True)
    for offer in match_schemes(a1):
        print(f"\n{offer.scheme_name} ({offer.scheme_code})")
        print(f"  Project cost: ₹{offer.project_cost:,.0f}  |  Loan: ₹{offer.loan_amount:,.0f}")
        print(f"  Rate: {offer.effective_interest_rate*100:.2f}%  |  Tenure: {offer.tenure_years}y  |  Moratorium: {offer.moratorium_months}mo")
        emi = generate_emi_schedule(offer)
        print(f"  Quarterly EMI: ₹{emi['quarterly_emi']:,.2f} over {emi['repayment_quarters']} quarters")

    print("\n\n=== Case 2: Woman only, ₹3L margin (too large for NSFDC/PMMY, fits Stand-Up India + Term Loan) ===")
    a2 = Applicant(available_margin=300_000, is_women_entrepreneur=True, is_sc_st=False)
    for offer in match_schemes(a2):
        print(f"\n{offer.scheme_name} ({offer.scheme_code})")
        print(f"  Project cost: ₹{offer.project_cost:,.0f}  |  Loan: ₹{offer.loan_amount:,.0f}")
        print(f"  Rate: {offer.effective_interest_rate*100:.2f}%  |  Tenure: {offer.tenure_years}y  |  Moratorium: {offer.moratorium_months}mo")