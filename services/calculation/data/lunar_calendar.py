"""
农历数据表 (Lunar Calendar Data) — Placeholder.

Contains lunar year information for converting between solar and lunar dates.

Each year entry stores:
- leap_month: which month is leap (0 = no leap)
- month_days: days in each month (1-12 or 1-13), 30=大月, 29=小月

Full implementation requires comprehensive data for 1900-2100.
"""

from typing import Dict, Optional

# Format: {year: {"leap": leap_month_index, "days": [days_per_month, ...]}}
LUNAR_YEAR_INFO: dict[int, dict] = {
    2024: {"leap": 0, "days": [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30]},
    2025: {"leap": 6, "days": [29, 30, 29, 30, 29, 29, 30, 30, 29, 30, 29, 30, 29]},
    2026: {"leap": 0, "days": [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]},
}


def get_lunar_year_info(year: int) -> Optional[dict]:
    """Get lunar calendar info for a given year."""
    return LUNAR_YEAR_INFO.get(year)
