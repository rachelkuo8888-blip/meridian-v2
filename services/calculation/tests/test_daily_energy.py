"""Tests for daily energy score calculation."""

import unittest
from engine.types import (
    Pillar, FourPillars, ElementDistribution, NatalChart, ZiWeiChart
)
from engine.daily_energy import (
    calculate_daily_energy,
    is_clash,
    is_combine,
    get_pillar_element,
)


class TestRelationships(unittest.TestCase):
    """Test branch relationship helpers."""

    def test_clash(self):
        """Test six clash relationships."""
        self.assertTrue(is_clash("子", "午"))
        self.assertTrue(is_clash("午", "子"))
        self.assertFalse(is_clash("子", "丑"))

    def test_combine(self):
        """Test six combination relationships."""
        self.assertTrue(is_combine("子", "丑"))
        self.assertTrue(is_combine("丑", "子"))
        self.assertFalse(is_combine("子", "午"))


class TestPillarElement(unittest.TestCase):
    """Test branch-to-element mapping."""

    def test_wood_branches(self):
        self.assertEqual(get_pillar_element(Pillar(stem="甲", branch="寅")), "wood")
        self.assertEqual(get_pillar_element(Pillar(stem="乙", branch="卯")), "wood")

    def test_fire_branches(self):
        self.assertEqual(get_pillar_element(Pillar(stem="丙", branch="午")), "fire")

    def test_water_branches(self):
        self.assertEqual(get_pillar_element(Pillar(stem="壬", branch="子")), "water")


class TestDailyEnergy(unittest.TestCase):
    """Test daily energy score calculation."""

    def setUp(self):
        """Create a sample NatalChart for testing.

        Natal chart: 甲子日 (day stem=甲, branch=子)
        Day master: 甲 (wood)
        Useful god: fire (weak wood needs fire)
        """
        day_pillar = Pillar(stem="甲", branch="子")
        self.natal = NatalChart(
            pillars=FourPillars(
                year=Pillar(stem="甲", branch="辰"),
                month=Pillar(stem="丙", branch="寅"),
                day=day_pillar,
                hour=Pillar(stem="甲", branch="子"),
            ),
            day_master="甲",
            element_distribution=ElementDistribution(
                wood=3.0, fire=1.0, earth=0.5, metal=0.0, water=1.5
            ),
            useful_god="fire",  # weak wood needs fire
            strength="weak",
            ziwei=ZiWeiChart(),
        )

    def test_baseline_score(self):
        """Test baseline score is 50 with neutral branch.

        丑 doesn't clash/combine with 子 (well, actually 子丑合!).
        Use 酉 instead - no clash, no combine, no sanhe with 子.
        """
        today = Pillar(stem="辛", branch="酉")  # neutral, no relation to 子
        score = calculate_daily_energy(self.natal, today)
        self.assertEqual(score, 50)

    def test_useful_god_bonus(self):
        """Test useful god matching adds 20 points.

        午 is fire (useful god), but also clashes with 子 (-15).
        So 50 + 20 - 15 = 55.
        """
        today = Pillar(stem="丙", branch="午")  # fire day, clashes with 子
        score = calculate_daily_energy(self.natal, today)
        self.assertEqual(score, 55)  # 50 + 20 (fire god) - 15 (子午冲)

    def test_clash_penalty(self):
        """Test clash with day branch reduces 15 points.

        午 clashes with 子, useful god is fire and 午 is fire.
        50 - 15 (clash) + 20 (useful god) = 55
        """
        today = Pillar(stem="丙", branch="午")
        score = calculate_daily_energy(self.natal, today)
        self.assertEqual(score, 55)

    def test_combine_bonus(self):
        """Test combination adds 10 points.

        丑 combines with 子 → +10.
        Also check if 丑 is fire (useful god) - no, 丑 is earth.
        So: 50 + 10 = 60.
        """
        today = Pillar(stem="己", branch="丑")  # 子丑合
        score = calculate_daily_energy(self.natal, today)
        self.assertEqual(score, 60)

    def test_sanhe_bonus(self):
        """Test 三合 bonus adds 5 points.

        申 belongs to 申子辰 三合 group with 子 → +5.
        申 is metal, not fire (useful god).
        So: 50 + 5 = 55.
        """
        today = Pillar(stem="庚", branch="申")
        score = calculate_daily_energy(self.natal, today)
        self.assertEqual(score, 55)

    def test_score_bounds(self):
        """Test score stays within 0-100."""
        # Multiple bonuses: fire (useful god) + combine
        today = Pillar(stem="丁", branch="未")  # 未 combines with 午... wait, 未 is earth
        # 未 doesn't combine/clash with 子. Is it fire? No, 未 is earth.
        # So baseline = 50
        score = calculate_daily_energy(self.natal, today)
        self.assertLessEqual(score, 100)
        self.assertGreaterEqual(score, 0)


if __name__ == "__main__":
    unittest.main()
