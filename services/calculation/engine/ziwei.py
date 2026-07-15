"""
Step 5: 紫微排盘 (Zi Wei Dou Shu) — Simplified MVP

This is a scaffolding implementation for the Zi Wei astrology system.
Full implementation requires:

1. Accurate solar terms for 紫微星 position
2. 安星法 star placement rules
3. 12 palace system with all stars
4. 四化 flying stars

Current implementation provides the empty chart structure.
"""

from typing import Optional, Dict, List
from .types import ZiWeiChart, Pillar, FourPillars


# ─── 12 宫位 (12 Palaces) ──────────────────────────────────────
PALACES: List[str] = [
    "命宫", "兄弟宫", "夫妻宫", "子女宫",
    "财帛宫", "疾厄宫", "迁移宫", "交友宫",
    "官禄宫", "田宅宫", "福德宫", "父母宫",
]

# ─── 主星 (Major Stars) ────────────────────────────────────────
MAJOR_STARS: List[str] = [
    "紫微", "天机", "太阳", "武曲", "天同", "廉贞",
    "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军",
]

# ─── 辅星 (Minor Stars) ────────────────────────────────────────
MINOR_STARS: List[str] = [
    "左辅", "右弼", "文昌", "文曲", "地空", "地劫",
    "天魁", "天钺", "禄存", "擎羊", "陀罗", "火星", "铃星",
    "天马",
]


def calculate_ziwei_chart(
    pillars: FourPillars,
) -> ZiWeiChart:
    """
    Calculate simplified Zi Wei chart.

    This is a placeholder/MVP version. Full implementation requires:
    - 安星法: Determine 紫微星 position based on birth date
    - 定十二宫: Calculate palace positions
    - 布星: Place all stars in their proper palaces
    - 四化: Apply 化禄/化权/化科/化忌 transformations

    Args:
        pillars: The Four Pillars for the birth time.

    Returns:
        ZiWeiChart with empty palace structure.
    """
    chart = ZiWeiChart()

    # Create empty palace entries
    for palace in PALACES:
        chart.palaces[palace] = None

    return chart
