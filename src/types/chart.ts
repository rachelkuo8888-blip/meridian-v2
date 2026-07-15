/**
 * Meridian V2 — ChartObject types (mirrors Python engine/types.py)
 * Source: services/calculation/engine/types.py
 */

export interface Pillar {
  stem: string; // 天干: 甲乙丙丁戊己庚辛壬癸
  branch: string; // 地支: 子丑寅卯辰巳午未申酉戌亥
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
}

export interface ElementDistribution {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface DaYun {
  pillar: Pillar;
  start_age: number;
  end_age: number;
}

export interface DaYunCycle {
  direction: 'forward' | 'backward';
  start_age: number;
  pillars: DaYun[];
}

export interface ZiWeiChart {
  life_palace_master: string | null;
  body_palace: string | null;
  twelve_palaces?: Record<string, string>;
}

export interface NatalChart {
  user_id: string;
  birth_date: string;
  pillars: FourPillars;
  day_master: string; // 日主天干
  element_distribution: ElementDistribution;
  useful_god: string; // 用神
  da_yun: DaYunCycle;
  liu_nian: Record<string, Pillar>;
  ziwei: ZiWeiChart;
  engine_version: string;
  computed_at: string;
}
