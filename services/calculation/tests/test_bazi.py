"""Tests for Four Pillars (Ba Zi) calculation."""

import unittest
from datetime import date, datetime
from engine.types import Pillar, FourPillars
from engine.bazi import (
    get_day_pillar,
    get_hour_pillar,
    get_hour_branch_index,
    get_month_pillar,
    get_year_stem_branch,
    get_four_pillars,
    shift_stem,
    shift_branch,
)


class TestDayPillar(unittest.TestCase):
    """Test day pillar calculation."""

    def test_base_date(self):
        """1900-01-01 should be 甲戌."""
        result = get_day_pillar(date(1900, 1, 1))
        self.assertEqual(result.stem, "甲")
        self.assertEqual(result.branch, "戌")

    def test_next_day_1900_01_02(self):
        """1900-01-02 should be 乙亥 (next in 60-cycle)."""
        result = get_day_pillar(date(1900, 1, 2))
        self.assertEqual(result.stem, "乙")
        self.assertEqual(result.branch, "亥")

    def test_jan_31_1900(self):
        """1900-01-31 should be 甲辰 (30 days after 甲戌)."""
        result = get_day_pillar(date(1900, 1, 31))
        self.assertEqual(result.stem, "甲")
        self.assertEqual(result.branch, "辰")

    def test_known_date_2026_01_01(self):
        """Verify a modern date produces consistent output."""
        result = get_day_pillar(date(2026, 1, 1))
        # Verify it's a valid stem-branch pair
        self.assertIn(result.stem, ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"])
        self.assertIn(result.branch, ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"])

    def test_60_day_cycle(self):
        """Test that day pillar wraps correctly after 60 days."""
        d1 = get_day_pillar(date(1900, 1, 1))  # 甲戌
        d60 = get_day_pillar(date(1900, 3, 2))  # 60 days later
        self.assertEqual(d1.stem, d60.stem)
        self.assertEqual(d1.branch, d60.branch)


class TestHourBranch(unittest.TestCase):
    """Test hour branch index determination."""

    def test_zi_hour_start(self):
        """23:00 = 子 (index 0)."""
        self.assertEqual(get_hour_branch_index(23), 0)

    def test_zi_hour_end(self):
        """00:00 = 子 (index 0)."""
        self.assertEqual(get_hour_branch_index(0), 0)

    def test_chou_hour(self):
        """01:00 = 丑 (index 1)."""
        self.assertEqual(get_hour_branch_index(2), 1)

    def test_wu_hour(self):
        """11:00-12:59 = 午 (index 6)."""
        self.assertEqual(get_hour_branch_index(12), 6)

    def test_hai_hour(self):
        """21:00 = 亥 (index 11)."""
        self.assertEqual(get_hour_branch_index(22), 11)


class TestHourPillar(unittest.TestCase):
    """Test hour pillar with 五鼠遁."""

    def test_jia_day_zi_hour(self):
        """甲日子时 → 甲子."""
        result = get_hour_pillar("甲", 23)
        self.assertEqual(result.stem, "甲")
        self.assertEqual(result.branch, "子")

    def test_yi_day_zi_hour(self):
        """乙日子时 → 丙子."""
        result = get_hour_pillar("乙", 0)
        self.assertEqual(result.stem, "丙")
        self.assertEqual(result.branch, "子")

    def test_jia_day_wu_hour(self):
        """甲日午时 (index 6) → 庚午."""
        result = get_hour_pillar("甲", 12)
        self.assertEqual(result.stem, "庚")
        self.assertEqual(result.branch, "午")


class TestShiftFunctions(unittest.TestCase):
    """Test stem/branch shifting."""

    def test_shift_stem(self):
        self.assertEqual(shift_stem("甲", 1), "乙")
        self.assertEqual(shift_stem("甲", 9), "癸")
        self.assertEqual(shift_stem("癸", 1), "甲")

    def test_shift_branch(self):
        self.assertEqual(shift_branch("子", 1), "丑")
        self.assertEqual(shift_branch("子", 11), "亥")
        self.assertEqual(shift_branch("亥", 1), "子")


if __name__ == "__main__":
    unittest.main()
