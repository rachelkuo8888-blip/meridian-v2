"""
地支关系表 (Branch Relationships).

Contains:
- 六冲 (Six Clashes): opposing branches
- 六合 (Six Combinations): harmonious branches
- 三合 (Three Combinations): triads
- 六害 (Six Harms): harmful combinations
- 相刑 (Three Punishments): punitive relationships
"""

from typing import Dict, List

# ─── 六冲 (Six Clashes) ─────────────────────────────────────────
CLASH_PAIRS: dict[str, str] = {
    "子": "午", "丑": "未", "寅": "申", "卯": "酉", "辰": "戌", "巳": "亥",
}

# ─── 六合 (Six Combinations) ────────────────────────────────────
COMBINE_PAIRS: dict[str, str] = {
    "子": "丑", "寅": "亥", "卯": "戌", "辰": "酉", "巳": "申", "午": "未",
}

# ─── 三合 (Three Combinations) ──────────────────────────────────
# Each branch in the group maps to its triad
THREE_COMBINATIONS: dict[str, List[str]] = {
    "申": ["申", "子", "辰"], "子": ["申", "子", "辰"], "辰": ["申", "子", "辰"],
    "亥": ["亥", "卯", "未"], "卯": ["亥", "卯", "未"], "未": ["亥", "卯", "未"],
    "寅": ["寅", "午", "戌"], "午": ["寅", "午", "戌"], "戌": ["寅", "午", "戌"],
    "巳": ["巳", "酉", "丑"], "酉": ["巳", "酉", "丑"], "丑": ["巳", "酉", "丑"],
}

# ─── 六害 (Six Harms) ──────────────────────────────────────────
HARM_PAIRS: dict[str, str] = {
    "子": "未", "丑": "午", "寅": "巳", "卯": "辰", "申": "亥", "酉": "戌",
}

# ─── 相刑 (Three Punishments) ───────────────────────────────────
PUNISHMENT_GROUPS: List[List[str]] = [
    ["寅", "巳", "申"],  # 无恩之刑
    ["丑", "未", "戌"],  # 恃势之刑
    ["子", "卯"],        # 无礼之刑
    ["辰", "辰", "午", "午", "酉", "酉", "亥", "亥"],  # 自刑
]


def is_clash(branch_a: str, branch_b: str) -> bool:
    """Check if two branches clash (六冲)."""
    return CLASH_PAIRS.get(branch_a) == branch_b or CLASH_PAIRS.get(branch_b) == branch_a


def is_combine(branch_a: str, branch_b: str) -> bool:
    """Check if two branches combine (六合)."""
    return COMBINE_PAIRS.get(branch_a) == branch_b or COMBINE_PAIRS.get(branch_b) == branch_a


def is_harm(branch_a: str, branch_b: str) -> bool:
    """Check if two branches harm (六害)."""
    return HARM_PAIRS.get(branch_a) == branch_b or HARM_PAIRS.get(branch_b) == branch_a
