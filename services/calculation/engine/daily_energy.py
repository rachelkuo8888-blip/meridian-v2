"""
Step 7: 每日能量分数 (Daily Energy Score)

Calculates a daily energy score (0-100) based on the relationship between
the user's natal chart and the current day's pillar.

Factors considered:
1. 用神 (Useful God) matching: +20
2. 六冲 (Six Clashes): -15
3. 六合 (Six Combinations): +10
4. 三合 (Three Combinations): +5
"""

from datetime import date
from typing import Dict, List

from .types import Pillar, NatalChart

# ─── 六冲关系 (Six Clashes) ─────────────────────────────────────
# Opposing branches (180° apart)
CLASH_PAIRS: dict[str, str] = {
    "子": "午", "丑": "未", "寅": "申", "卯": "酉", "辰": "戌", "巳": "亥",
}

# ─── 六合关系 (Six Combinations) ────────────────────────────────
COMBINE_PAIRS: dict[str, str] = {
    "子": "丑", "寅": "亥", "卯": "戌", "辰": "酉", "巳": "申", "午": "未",
}

# ─── 三合局 (Three Combinations) ────────────────────────────────
SAN_HE: dict[str, List[str]] = {
    "申": ["申", "子", "辰"], "子": ["申", "子", "辰"], "辰": ["申", "子", "辰"],
    "亥": ["亥", "卯", "未"], "卯": ["亥", "卯", "未"], "未": ["亥", "卯", "未"],
    "寅": ["寅", "午", "戌"], "午": ["寅", "午", "戌"], "戌": ["寅", "午", "戌"],
    "巳": ["巳", "酉", "丑"], "酉": ["巳", "酉", "丑"], "丑": ["巳", "酉", "丑"],
}

# ─── 地支五行映射 (for quick lookup in this module) ────────────
BRANCH_ELEMENT: dict[str, str] = {
    "寅": "wood", "卯": "wood", "巳": "fire", "午": "fire",
    "辰": "earth", "戌": "earth", "丑": "earth", "未": "earth",
    "申": "metal", "酉": "metal", "子": "water", "亥": "water",
}


def is_clash(branch1: str, branch2: str) -> bool:
    """Check if two earthly branches are in a six-clash relationship."""
    return CLASH_PAIRS.get(branch1) == branch2 or CLASH_PAIRS.get(branch2) == branch1


def is_combine(branch1: str, branch2: str) -> bool:
    """Check if two earthly branches are in a six-combination relationship."""
    return COMBINE_PAIRS.get(branch1) == branch2 or COMBINE_PAIRS.get(branch2) == branch1


def get_pillar_element(pillar: Pillar) -> str:
    """Get the element of a pillar (based on branch)."""
    return BRANCH_ELEMENT.get(pillar.branch, "earth")


def calculate_daily_energy(
    natal: NatalChart,
    today_pillar: Pillar,
) -> int:
    """
    Calculate daily energy score (0-100).

    Scoring:
        - Baseline: 50 points
        - 用神 matching day element: +20
        - Day branch clashes with natal day branch: -15
        - Day branch combines with natal day branch: +10
        - Day branch is in 三合 with natal day branch: +5

    Args:
        natal: The user's natal chart.
        today_pillar: The pillar of today (or any target day).

    Returns:
        Integer score from 0 to 100.
    """
    score = 50

    # Rule 1: Useful God matching
    today_element = get_pillar_element(today_pillar)
    if today_element == natal.useful_god:
        score += 20
    elif get_pillar_element(natal.pillars.day) == natal.useful_god:
        # Check if natal day element IS the useful god
        pass

    # Rule 2: Six Clash with natal day branch
    if is_clash(today_pillar.branch, natal.pillars.day.branch):
        score -= 15

    # Rule 3: Six Combination with natal day branch
    if is_combine(today_pillar.branch, natal.pillars.day.branch):
        score += 10

    # Rule 4: 三合局 involvement
    san_he_group = SAN_HE.get(today_pillar.branch, [])
    if natal.pillars.day.branch in san_he_group:
        score += 5

    return max(0, min(100, score))
