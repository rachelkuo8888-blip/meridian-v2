"""Tests for true solar time correction."""

import unittest
from datetime import datetime
from engine.solar import correct_to_true_solar_time, get_eot_correction


class TestSolarCorrection(unittest.TestCase):
    """Test true solar time correction logic."""

    def test_eot_lookup(self):
        """Test equation of time lookup."""
        self.assertAlmostEqual(get_eot_correction("01-01"), -3.4)
        self.assertAlmostEqual(get_eot_correction("04-15"), 0.0)
        self.assertAlmostEqual(get_eot_correction("07-01"), -3.5)
        self.assertAlmostEqual(get_eot_correction("10-15"), 15.0)

    def test_eot_unknown_date_returns_zero(self):
        """Test unknown date returns 0.0."""
        self.assertAlmostEqual(get_eot_correction("02-30"), 0.0)

    def test_correct_to_true_solar_time_no_correction(self):
        """Test when at standard longitude with no EOT."""
        # April 15: EOT ≈ 0
        dt = datetime(2026, 4, 15, 12, 0, 0)
        result = correct_to_true_solar_time(dt, 120.0, 120.0)
        self.assertEqual(result.hour, 12)
        self.assertEqual(result.minute, 0)

    def test_correct_to_true_solar_time_westward(self):
        """Test when birthplace is west of standard longitude.

        105°E is 15° west of 120°E.
        True solar time = civil + (105 - 120) * 4 = -60 min → 11:00.
        """
        dt = datetime(2026, 4, 15, 12, 0, 0)
        result = correct_to_true_solar_time(dt, 105.0, 120.0)
        self.assertEqual(result.hour, 11)
        self.assertEqual(result.minute, 0)

    def test_correct_to_true_solar_time_eastward(self):
        """Test when birthplace is east of standard longitude.

        135°E is 15° east of 120°E.
        True solar time = civil + (135 - 120) * 4 = +60 min → 13:00.
        """
        dt = datetime(2026, 4, 15, 12, 0, 0)
        result = correct_to_true_solar_time(dt, 135.0, 120.0)
        self.assertEqual(result.hour, 13)
        self.assertEqual(result.minute, 0)


if __name__ == "__main__":
    unittest.main()
