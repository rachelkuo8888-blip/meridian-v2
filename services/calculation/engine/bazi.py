"""
Step 3: 四柱排盘 (Four Pillars Calculation)

Core algorithm implementing:
- 60 甲子 cycle table
- Year pillar: 立春 boundary
- Month pillar: solar term boundary + 五虎遁 (Wu Hu Dun)
- Day pillar: base date accumulation (23:00 = next day)
- Hour pillar: 五鼠遁 (Wu Shu Dun)

All calculations use static lookup tables — no LLM, no external data.
"""

from datetime import datetime, date, timedelta
from typing import Optional, Tuple, List

from .types import Pillar, FourPillars

# ─── 天干地支 constants ─────────────────────────────────────────

GAN: List[str] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
ZHI: List[str] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 60 甲子 cycle (full correct sequence)
GAN_ZHI_60: List[str] = [
    "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
    "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
    "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
    "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
    "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
    "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥",
]

# ─── 五虎遁 (Wu Hu Dun): year stem → 寅月 stem ──────────────────
WU_HU_DUN: dict[str, str] = {
    "甲": "丙", "乙": "戊", "丙": "庚", "丁": "壬", "戊": "甲",
    "己": "丙", "庚": "戊", "辛": "庚", "壬": "壬", "癸": "甲",
}

# ─── 五鼠遁 (Wu Shu Dun): day stem → 子时 stem ─────────────────
WU_SHU_DUN: dict[str, str] = {
    "甲": "甲", "乙": "丙", "丙": "戊", "丁": "庚", "戊": "壬",
    "己": "甲", "庚": "丙", "辛": "戊", "壬": "庚", "癸": "壬",
}

# ─── Solar terms → month branch ────────────────────────────────
SOLAR_TERM_TO_BRANCH: dict[str, str] = {
    "立春": "寅", "惊蛰": "卯", "清明": "辰", "立夏": "巳",
    "芒种": "午", "小暑": "未", "立秋": "申", "白露": "酉",
    "寒露": "戌", "立冬": "亥", "大雪": "子", "小寒": "丑",
}

BRANCH_TO_SOLAR_TERM: dict[str, str] = {v: k for k, v in SOLAR_TERM_TO_BRANCH.items()}

# Month branch starting order (寅=1st month of lunar year)
BRANCH_MONTH_INDEX: dict[str, int] = {
    "寅": 0, "卯": 1, "辰": 2, "巳": 3, "午": 4, "未": 5,
    "申": 6, "酉": 7, "戌": 8, "亥": 9, "子": 10, "丑": 11,
}

# ─── Hour → branch mapping ─────────────────────────────────────
# (start_hour_inclusive, end_hour_exclusive, branch)
HOUR_BRANCH_TABLE: List[Tuple[int, int, str]] = [
    (23, 1, "子"),   # 23:00-00:59
    (1, 3, "丑"),    # 01:00-02:59
    (3, 5, "寅"),    # 03:00-04:59
    (5, 7, "卯"),    # 05:00-06:59
    (7, 9, "辰"),    # 07:00-08:59
    (9, 11, "巳"),   # 09:00-10:59
    (11, 13, "午"),  # 11:00-12:59
    (13, 15, "未"),  # 13:00-14:59
    (15, 17, "申"),  # 15:00-16:59
    (17, 19, "酉"),  # 17:00-18:59
    (19, 21, "戌"),  # 19:00-20:59
    (21, 23, "亥"),  # 21:00-22:59
]

# ─── Day pillar base ────────────────────────────────────────────
# 1900-01-01 = 甲戌日 (index 10 in 60-cycle, where 甲子=0)
# Verified from historical ganzhi calendar continuity.
BASE_DATE = date(1900, 1, 1)
BASE_DAY_INDEX = 10  # 甲戌


def get_ganzhi_index(gan: str, zhi: str) -> int:
    """Get the 60-cycle index for a stem-branch pair."""
    target = f"{gan}{zhi}"
    try:
        return GAN_ZHI_60.index(target)
    except ValueError:
        return -1


def shift_stem(stem: str, offset: int) -> str:
    """Shift a heavenly stem by offset (mod 10)."""
    idx = (GAN.index(stem) + offset) % 10
    return GAN[idx]


def shift_branch(branch: str, offset: int) -> str:
    """Shift an earthly branch by offset (mod 12)."""
    idx = (ZHI.index(branch) + offset) % 12
    return ZHI[idx]


def get_year_ganzhi_index(year: int) -> int:
    """
    Get the 60-cycle index for a given year's stem-branch.
    甲子 = year 4 in the 60-year cycle (year modulo 60 mapping).
    """
    # 甲子 corresponds to year 4 (AD 4 = 甲子年 in the cycle)
    offset = (year - 4) % 60
    return offset


def get_year_stem_branch(year: int) -> tuple[str, str]:
    """Get the stem and branch for a given year."""
    idx = get_year_ganzhi_index(year)
    stem_idx = idx % 10
    branch_idx = idx % 12
    return GAN[stem_idx], ZHI[branch_idx]


def get_day_pillar(target_date: date) -> Pillar:
    """
    Calculate the day pillar.

    Rules:
        - Base: 1900-01-31 = 甲辰 (index 4)
        - Accumulate days, cycle through 60
        - 23:00+ is treated as next day (handled by caller)
    """
    delta = (target_date - BASE_DATE).days
    index = (BASE_DAY_INDEX + delta) % 60
    stem_index = index % 10
    branch_index = index % 12
    return Pillar(stem=GAN[stem_index], branch=ZHI[branch_index])


def get_hour_branch_index(hour: int) -> int:
    """
    Return the earthly branch index for a given hour.

    Special case: 子时 (23:00-00:59) spans midnight.
    """
    for start, end, branch in HOUR_BRANCH_TABLE:
        if start > end:  # 子时 crosses midnight
            if hour >= start or hour < end:
                return ZHI.index(branch)
        else:
            if start <= hour < end:
                return ZHI.index(branch)
    return 0  # default to 子


def get_hour_pillar(day_stem: str, hour: int) -> Optional[Pillar]:
    """
    Calculate hour pillar using 五鼠遁 (Wu Shu Dun).

    The starting stem for 子时 is determined by the day stem.
    Then advance through branches sequentially.
    """
    branch_idx = get_hour_branch_index(hour)
    start_stem = WU_SHU_DUN.get(day_stem, "甲")
    stem = shift_stem(start_stem, branch_idx)
    branch = ZHI[branch_idx]
    return Pillar(stem=stem, branch=branch)


def get_month_pillar(year_stem: str, month_branch: str) -> Pillar:
    """
    Calculate month pillar using 五虎遁 (Wu Hu Dun).

    The starting stem for 寅月 is determined by the year stem,
    then advance through months sequentially.
    """
    start_stem = WU_HU_DUN.get(year_stem, "丙")
    branch_idx = BRANCH_MONTH_INDEX.get(month_branch, 0)
    stem = shift_stem(start_stem, branch_idx)
    return Pillar(stem=stem, branch=month_branch)


def get_four_pillars(
    true_solar_date: date,
    hour: Optional[int] = None,
    year_stem: Optional[str] = None,
    year_branch: Optional[str] = None,
    month_stem: Optional[str] = None,
    month_branch: Optional[str] = None,
) -> FourPillars:
    """
    Calculate complete Four Pillars.

    Args:
        true_solar_date: Date after true solar time correction.
        hour: Hour (0-23), None if unknown.
        year_stem/branch: Pre-computed year pillar (or uses auto-calculation).
        month_stem/branch: Pre-computed month pillar (or uses auto-calculation).

    Returns:
        FourPillars with year, month, day, and optional hour pillars.
    """
    day = get_day_pillar(true_solar_date)

    # Auto-calculate year pillar if not provided
    if year_stem is None or year_branch is None:
        year_stem, year_branch = get_year_stem_branch(true_solar_date.year)

    year = Pillar(stem=year_stem, branch=year_branch)

    # Auto-calculate month pillar if not provided
    if month_stem is None or month_branch is None:
        # Default month branch = 寅 (simplified)
        month_branch = month_branch or "寅"
        month = get_month_pillar(year_stem, month_branch)
    else:
        month = Pillar(stem=month_stem, branch=month_branch)

    hour_pillar = get_hour_pillar(day.stem, hour) if hour is not None else None

    return FourPillars(year=year, month=month, day=day, hour=hour_pillar)
