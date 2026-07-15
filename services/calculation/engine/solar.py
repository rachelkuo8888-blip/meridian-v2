"""
Step 1: 真太阳时校正 (True Solar Time Correction)

Converts civil time to true solar time based on longitude and equation of time.

Formula:
    true_solar_time = civil_time + (longitude - standard) * 4 min/deg + EOT
"""

from datetime import datetime, timedelta
from typing import Optional

# Simplified equation of time table (MM-DD → minutes).
# Full astronomical data would have 366 entries per year.
# Values sourced from approximate annual EOT curve.
EQUATION_OF_TIME_TABLE: dict[str, float] = {
    "01-01": -3.4, "01-15": -9.2, "02-01": -13.6, "02-15": -14.3,
    "03-01": -12.6, "03-15": -9.2, "04-01": -4.0, "04-15": 0.0,
    "05-01": 2.9, "05-15": 3.8, "06-01": 2.4, "06-15": 0.0,
    "07-01": -3.5, "07-15": -6.0, "08-01": -6.3, "08-15": -4.5,
    "09-01": -0.5, "09-15": 4.5, "10-01": 10.2, "10-15": 15.0,
    "11-01": 16.3, "11-15": 14.8, "12-01": 10.8, "12-15": 5.5,
    "12-31": -0.2,
}


def get_eot_correction(date_str: str) -> float:
    """Look up equation of time correction for a given date (MM-DD)."""
    return EQUATION_OF_TIME_TABLE.get(date_str, 0.0)


def correct_to_true_solar_time(
    civil_time: datetime,
    longitude: float,
    tz_standard_longitude: float = 120.0,
) -> datetime:
    """
    Correct civil time to true solar time.

    Args:
        civil_time: Local civil time (naive datetime).
        longitude: Observer's longitude (decimal degrees, east positive).
        tz_standard_longitude: Time zone's reference longitude.
            China = 120°E, UTC+0 = 0°, Japan = 135°E, etc.

    Returns:
        Corrected true solar time as a naive datetime.
    """
    lon_correction_minutes = (longitude - tz_standard_longitude) * 4.0
    eot_correction = get_eot_correction(civil_time.strftime("%m-%d"))
    total_correction = lon_correction_minutes + eot_correction
    return civil_time + timedelta(minutes=total_correction)
