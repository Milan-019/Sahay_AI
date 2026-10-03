"""
Eligibility and business rule definitions.
[DECISION: Redundant / Keep folded in finance.py - placeholder/alias reference]
"""

# Re-export / fold references into finance engine where appropriate
from .finance import (
    AFFIRMATIVE_SCHEMES,
    evaluate_stacking,
    evaluate_tiering,
)

__all__ = [
    "AFFIRMATIVE_SCHEMES",
    "evaluate_tiering",
    "evaluate_stacking",
]
