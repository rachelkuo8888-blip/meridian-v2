"""
紫微斗数查表数据 (Zi Wei Dou Shu Reference Tables) — Scaffold.

Full implementation requires:
- 紫微星 placement table by birth date
- 天府星 placement table
- 12 palace positions
- Star attributes (庙旺利陷)
- 四化 tables (化禄/化权/化科/化忌)
"""

from typing import Dict, List, Optional

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

# ─── 四化 (Four Transformations) — placeholder ─────────────────
# Key: star name, Value: transformation type by heavenly stem
FOUR_HUA: Dict[str, Dict[str, str]] = {}

# ─── 紫微星安星表 (Zi Wei Star Placement) — placeholder ────────
# Key: birth day (1-30), Value: index in 紫微 chart grid
ZI_WEI_POSITION: Dict[int, int] = {}
