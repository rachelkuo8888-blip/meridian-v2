"""Core type definitions for the Calculation Engine.

All data classes shared across modules. Outputs unified ChartObject JSON schema.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional, List, Dict
import json


@dataclass
class Pillar:
    """A single pillar (天干地支 pair)."""
    stem: str  # 天干
    branch: str  # 地支

    def to_dict(self) -> Dict:
        return {"stem": self.stem, "branch": self.branch}


@dataclass
class FourPillars:
    """四柱: year, month, day, hour pillars."""
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Optional[Pillar]


@dataclass
class ElementDistribution:
    """五行分布 (wood, fire, earth, metal, water)."""
    wood: float = 0.0
    fire: float = 0.0
    earth: float = 0.0
    metal: float = 0.0
    water: float = 0.0


@dataclass
class DaYun:
    """A single 大运 period."""
    pillar: Pillar
    start_age: float
    end_age: float


@dataclass
class DaYunCycle:
    """Full 大运 cycle (forward or backward)."""
    direction: str  # "forward" | "backward"
    start_age: float
    pillars: List[DaYun]


@dataclass
class ZiWeiChart:
    """紫微斗数 chart (simplified MVP)."""
    life_palace_master: Optional[str] = None
    body_palace_master: Optional[str] = None
    palaces: Dict[str, Optional[str]] = field(default_factory=dict)


@dataclass
class NatalChart:
    """命盘: four pillars + analysis."""
    pillars: FourPillars
    day_master: str  # 日主
    element_distribution: ElementDistribution
    useful_god: str  # 用神
    strength: str  # "strong" | "weak" | "balanced"
    ziwei: Optional[ZiWeiChart] = None


@dataclass
class ChartObject:
    """Top-level output schema for the engine."""
    user_id: str
    natal: NatalChart
    current_cycle: Dict = field(default_factory=dict)
    computed_at: str = ""
    engine_version: str = "calc-v1.0"

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False, indent=2)
