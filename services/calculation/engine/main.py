"""
Unified entry point for the Calculation Engine.

Takes raw inputs (user_id, birth_date, birth_hour, longitude, timezone)
and produces a complete ChartObject with all deterministic calculations.
"""

from datetime import datetime, timezone
from typing import Optional

from .types import ChartObject, NatalChart, Pillar, FourPillars, ElementDistribution, ZiWeiChart
from .bazi import get_four_pillars
from .elements import calculate_element_distribution, judge_strength, determine_useful_god
from .solar import correct_to_true_solar_time

ENGINE_VERSION = "calc-v1.0"


def generate_chart(
    user_id: str,
    birth_date: str,
    birth_hour: Optional[int] = None,
    longitude: Optional[float] = None,
    timezone_std_longitude: Optional[float] = 120.0,
    gender: Optional[str] = None,
) -> ChartObject:
    """
    Full chart calculation pipeline.

    Pipeline steps:
        1. Parse input date/time
        2. Apply true solar time correction (if longitude provided)
        3. Calculate Four Pillars (年柱, 月柱, 日柱, 时柱)
        4. Analyze Five Elements distribution
        5. Judge day master strength
        6. Determine useful god
        7. Calculate Zi Wei chart (simplified MVP)
        8. Calculate Da Yun cycles (if gender provided)

    Args:
        user_id: Unique identifier for the user.
        birth_date: "YYYY-MM-DD" format birth date.
        birth_hour: Birth hour (0-23), None if unknown.
        longitude: Birthplace longitude in decimal degrees (east positive).
        timezone_std_longitude: Time zone reference longitude.
            Default 120.0 (China standard time UTC+8).
        gender: "male" or "female". Required for Da Yun calculation.

    Returns:
        Complete ChartObject with all computed fields.
    """
    # Step 0: Parse input
    dt = datetime.strptime(birth_date, "%Y-%m-%d")

    # Step 1: True Solar Time Correction
    if longitude is not None and birth_hour is not None:
        corrected = correct_to_true_solar_time(
            dt.replace(hour=birth_hour),
            longitude,
            timezone_std_longitude or 120.0,
        )
        final_date = corrected.date()
        final_hour = corrected.hour
    else:
        final_date = dt.date()
        final_hour = birth_hour

    # Handle 23:00+ where hour belongs to next day's pillar
    if final_hour is not None and final_hour == 23:
        # 子时 starts at 23:00 - the branch is still 子 of today,
        # but some traditions use the next day's stem for calculation.
        # For simplicity, keep same date and handle in hour pillar.
        pass

    # Step 2-3: Four Pillars
    # Auto-calculate year pillar from birth year
    from .bazi import get_year_stem_branch

    year_stem, year_branch = get_year_stem_branch(final_date.year)

    # For month pillar, default to 寅 (simplified - needs solar terms)
    month_stem_from_year = {
        "甲": "丙", "乙": "戊", "丙": "庚", "丁": "壬", "戊": "甲",
        "己": "丙", "庚": "戊", "辛": "庚", "壬": "壬", "癸": "甲",
    }
    month_branch = "寅"  # simplified default
    month_stem = month_stem_from_year.get(year_stem, "丙")

    pillars = get_four_pillars(
        true_solar_date=final_date,
        hour=final_hour,
        year_stem=year_stem,
        year_branch=year_branch,
        month_stem=month_stem,
        month_branch=month_branch,
    )

    # Step 4: Five Elements Analysis
    day_master = pillars.day.stem
    element_dist = calculate_element_distribution(pillars)
    strength = judge_strength(day_master, element_dist, pillars.month.branch)
    useful_god = determine_useful_god(strength, day_master)

    # Step 5: Zi Wei (simplified MVP)
    from .ziwei import calculate_ziwei_chart

    ziwei = calculate_ziwei_chart(pillars)

    # Step 6: Natal Chart
    natal = NatalChart(
        pillars=pillars,
        day_master=day_master,
        element_distribution=element_dist,
        useful_god=useful_god,
        strength=strength,
        ziwei=ziwei,
    )

    # Step 7: Da Yun (if gender provided)
    current_cycle = {}
    if gender:
        from .cycles import (determine_da_yun_direction,
                            calculate_da_yun_start_age,
                            generate_da_yun_pillars)

        direction = determine_da_yun_direction(year_stem, gender)
        start_age = calculate_da_yun_start_age(final_date, month_branch, direction)
        cycle = generate_da_yun_pillars(pillars.month, direction, start_age)

        current_cycle = {
            "da_yun": {
                "direction": cycle.direction,
                "start_age": cycle.start_age,
                "pillars": [
                    {"stem": p.pillar.stem, "branch": p.pillar.branch,
                     "start_age": p.start_age, "end_age": p.end_age}
                    for p in cycle.pillars
                ],
            }
        }

    return ChartObject(
        user_id=user_id,
        natal=natal,
        current_cycle=current_cycle,
        computed_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        engine_version=ENGINE_VERSION,
    )
