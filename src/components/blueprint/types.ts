/**
 * Shared types for Blueprint components
 */

export interface PillarObject {
  stem: string
  branch: string
}

export interface PillarsObject {
  year: PillarObject
  month: PillarObject
  day: PillarObject
  hour: PillarObject
}

export interface ElementDistribution {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}

export interface DaYunSegment {
  stem: string
  branch: string
  start_age: number
  end_age: number
}

export interface ZiWeiData {
  life_palace_master: string
  body_palace_master: string
  palaces: Record<string, string>
}

export interface ChartData {
  user_id: string
  natal: {
    pillars: PillarsObject
    day_master: string
    element_distribution: ElementDistribution
    useful_god?: string
    strength?: string
    ziwei?: ZiWeiData
  }
  current_cycle?: {
    da_yun: {
      direction: string
      start_age: number
      pillars: DaYunSegment[]
    }
  }
}
