"""
Step 6: 大运/流年 (Da Yun / Liu Nian — Decade Cycles & Year Cycles)

Calculates:
1. 起运年龄 (Starting age for Da Yun)
2. 大运顺逆 (Direction of Da Yun: forward or backward)
3. 大运排盘 (10-year cycle pillars)
4. 流年 (Annual pillar)

Key rules:
- Male born in yang years (阳年) → forward
- Male born in yin years (阴年) → backward
- Female born in yang years → backward
- Female born in yin years → forward
- 大运 starts at the count from birth to next/prev solar term change
"""

from datetime import date
from typing import Optional, Tuple, List

from .types import Pillar, DaYun, DaYunCycle, FourPillars

# ─── 阳年 / 阴年 ────────────────────────────────────────────────
# 阳 (Yang) years: 甲, 丙, 戊, 庚, 壬 (odd-indexed heavenly stems)
# 阴 (Yin) years: 乙, 丁, 己, 辛, 癸 (even-indexed heavenly stems)
YANG_STEMS: set[str] = {"甲", "丙", "戊", "庚", "壬"}
YIN_STEMS: set[str] = {"乙", "丁", "己", "辛", "癸"}

# ─── 大运 helpers ───────────────────────────────────────────────
# A Da Yun pillar advances/retreats by 1 stem and 1 branch every 10 years
# from the month pillar


def is_yang_year(stem: str) -> bool:
    """Check if a heavenly stem is yang (阳)."""
    return stem in YANG_STEMS


def is_yin_year(stem: str) -> bool:
    """Check if a heavenly stem is yin (阴)."""
    return stem in YIN_STEMS


def determine_da_yun_direction(
    year_stem: str,
    gender: str,
) -> str:
    """
    Determine Da Yun direction.

    Rules:
        Male (男命):
            - 阳年 → "forward" (顺排)
            - 阴年 → "backward" (逆排)
        Female (女命):
            - 阳年 → "backward"
            - 阴年 → "forward"

    Args:
        year_stem: The stem of the year pillar.
        gender: "male" or "female".

    Returns:
        "forward" or "backward"
    """
    is_yang = is_yang_year(year_stem)

    if gender == "male":
        return "forward" if is_yang else "backward"
    else:  # female
        return "backward" if is_yang else "forward"


def calculate_da_yun_start_age(
    birth_date: date,
    month_pillar_branch: str,
    direction: str,
) -> int:
    """
    Calculate the starting age for Da Yun (起运年龄).

    Simplified: counts days between birth and the next (forward) or
    previous (backward) solar term change, converted to years
    (3 days = 1 year, 1 day = 4 months).

    Note: Full implementation requires precise solar term dates.
    This simplified version returns a reasonable default.

    Returns:
        Starting age (rounded up to nearest integer).
    """
    # Simplified: return default starting age
    # In production: count days to next/prev solar term → convert to years
    return 10


def generate_da_yun_pillars(
    month_pillar: Pillar,
    direction: str,
    start_age: int,
    num_pillars: int = 8,
) -> DaYunCycle:
    """
    Generate the sequence of Da Yun pillars.

    Each Da Yun lasts 10 years, advancing or retreating
    from the month pillar.

    Args:
        month_pillar: The month pillar of the natal chart.
        direction: "forward" (advance) or "backward" (retreat).
        start_age: Age when Da Yun begins.
        num_pillars: Number of Da Yun periods (default 8 = 80 years).

    Returns:
        DaYunCycle with all pillars and ages.
    """
    GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
    ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

    stem_idx = GAN.index(month_pillar.stem)
    branch_idx = ZHI.index(month_pillar.branch)

    pillars: List[DaYun] = []
    step = 1 if direction == "forward" else -1

    for i in range(num_pillars):
        s_idx = (stem_idx + step * i) % 10
        b_idx = (branch_idx + step * i) % 12
        pillar = Pillar(stem=GAN[s_idx], branch=ZHI[b_idx])

        start = start_age + i * 10
        end = date.today().year  # placeholder, should be start_age + (i+1)*10
        da_yun = DaYun(pillar=pillar, start_age=float(start), end_age=float(start + 10))
        pillars.append(da_yun)

    return DaYunCycle(
        direction=direction,
        start_age=float(start_age),
        pillars=pillars,
    )


def get_current_da_yun(
    age: float,
    cycle: DaYunCycle,
) -> Optional[DaYun]:
    """
    Find the current Da Yun period for a given age.
    """
    for period in cycle.pillars:
        if period.start_age <= age < period.end_age:
            return period
    return None


def get_annual_pillar(year: int) -> Pillar:
    """
    Get the pillar for a given year (流年).

    Uses the 60-year cycle: 甲子 corresponds to year 4 AD.
    """
    from .bazi import get_year_stem_branch

    stem, branch = get_year_stem_branch(year)
    return Pillar(stem=stem, branch=branch)
