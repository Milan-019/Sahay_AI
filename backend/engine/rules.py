"""
Eligibility and business rule definitions.
[DECISION: Redundant / Keep folded in finance.py - placeholder/alias reference]

FIXED: this file previously imported evaluate_stacking / evaluate_tiering,
neither of which exist in finance.py (that logic lives in the private
functions _general_tier_offer / _select_general_tier instead). Nothing in
the codebase currently imports engine.rules, so this was a dormant
ImportError waiting for the first import — fixed by re-exporting the
symbols that actually exist. Keep this in sync if finance.py's public
names change.
"""

from .finance import (
    AFFIRMATIVE_SCHEMES,
    get_scheme_offer_by_code,
    match_schemes,
    resolve_scheme_code,
)

__all__ = [
    "AFFIRMATIVE_SCHEMES",
    "match_schemes",
    "get_scheme_offer_by_code",
    "resolve_scheme_code",
]