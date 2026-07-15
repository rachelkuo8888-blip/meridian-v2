"""
节气表 (Solar Terms Table) — Placeholder/Scaffold.

24 solar terms with approximately dates.
Full implementation should include exact datetime for each term
every year (1900-2100) for accurate month pillar determination.

Term order:
立春 → 雨水 → 惊蛰 → 春分 → 清明 → 谷雨 →
立夏 → 小满 → 芒种 → 夏至 → 小暑 → 大暑 →
立秋 → 处暑 → 白露 → 秋分 → 寒露 → 霜降 →
立冬 → 小雪 → 大雪 → 冬至 → 小寒 → 大寒
"""

from datetime import datetime
from typing import Optional, Dict, List

SOLAR_TERMS: list[str] = [
    "立春", "雨水", "惊蛰", "春分", "清明", "谷雨",
    "立夏", "小满", "芒种", "夏至", "小暑", "大暑",
    "立秋", "处暑", "白露", "秋分", "寒露", "霜降",
    "立冬", "小雪", "大雪", "冬至", "小寒", "大寒",
]

# Approximate dates (month-day) — these vary yearly
SOLAR_TERM_APPROX: dict[str, str] = {
    "立春": "02-04", "雨水": "02-19", "惊蛰": "03-06", "春分": "03-21",
    "清明": "04-05", "谷雨": "04-20", "立夏": "05-06", "小满": "05-21",
    "芒种": "06-06", "夏至": "06-21", "小暑": "07-07", "大暑": "07-23",
    "立秋": "08-08", "处暑": "08-23", "白露": "09-08", "秋分": "09-23",
    "寒露": "10-08", "霜降": "10-24", "立冬": "11-08", "小雪": "11-22",
    "大雪": "12-07", "冬至": "12-22", "小寒": "01-06", "大寒": "01-20",
}

# Exact solar term times for key years — to be expanded
SOLAR_TERM_TIMES: dict[int, dict[str, datetime]] = {}


def get_solar_term_time(year: int, term: str) -> Optional[datetime]:
    """Get the exact datetime of a solar term for a given year."""
    year_data = SOLAR_TERM_TIMES.get(year, {})
    return year_data.get(term)
