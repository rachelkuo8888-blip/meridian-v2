"""
地支藏干表 (Hidden Stems in Earthly Branches).

Each earthly branch contains one or more heavenly stems.
The weight indicates relative influence:
- 1.0 = primary (本气)
- 0.6 = secondary (中气)
- 0.3 = tertiary (余气)
- 0.1 = residual
"""

from typing import Dict

HIDDEN_STEMS: dict[str, dict[str, float]] = {
    "子": {"癸": 1.0},
    "丑": {"己": 0.6, "癸": 0.3, "辛": 0.1},
    "寅": {"甲": 0.6, "丙": 0.3, "戊": 0.1},
    "卯": {"乙": 1.0},
    "辰": {"戊": 0.6, "乙": 0.3, "癸": 0.1},
    "巳": {"丙": 0.6, "庚": 0.3, "戊": 0.1},
    "午": {"丁": 0.6, "己": 0.3},
    "未": {"己": 0.6, "丁": 0.3, "乙": 0.1},
    "申": {"庚": 0.6, "壬": 0.3, "戊": 0.1},
    "酉": {"辛": 1.0},
    "戌": {"戊": 0.6, "辛": 0.3, "丁": 0.1},
    "亥": {"壬": 0.6, "甲": 0.3},
}

# Secondary mapping: 地支 → list of hidden stem weights
HIDDEN_STEMS_FLAT: dict[str, list[tuple[str, float]]] = {
    branch: list(stems.items())
    for branch, stems in HIDDEN_STEMS.items()
}
