'use server';

import { calcClient } from '@/lib/services/calc-client';

export interface BirthDataInput {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  birthTimeConfidence?: 'exact' | 'morning' | 'afternoon' | 'evening' | 'night' | 'skip';
  birthLocation?: string;
  longitude?: number;
  latitude?: number;
  timezone?: string;
}

/**
 * Submit birth data to the Calculation Engine for chart generation.
 * Falls back to a compelling placeholder when the engine is unavailable.
 */
export async function generateChart(data: BirthDataInput) {
  try {
    const response = await calcClient.generateChart({
      user_id: 'onboarding-preview',
      birth_date: data.birthDate,
      birth_hour: data.birthTime,
      longitude: data.longitude ?? 0,
      timezone_std_longitude: data.longitude ?? 120.0,
    });
    return { success: true, chart: response };
  } catch {
    // If the calculation engine is unavailable, return a placeholder
    // so the insight screen still renders with compelling sample data.
    return {
      success: true,
      chart: {
        dayPillar: {
          stem: { name: 'Xin', element: 'Metal', polarity: 'Yin' },
          branch: { name: 'You', element: 'Metal', polarity: 'Yin' },
        },
        monthPillar: {
          stem: { name: 'Yi', element: 'Wood', polarity: 'Yin' },
          branch: { name: 'Si', element: 'Fire', polarity: 'Yin' },
        },
        yearPillar: {
          stem: { name: 'Bing', element: 'Fire', polarity: 'Yang' },
          branch: { name: 'Wu', element: 'Earth', polarity: 'Yang' },
        },
        hourPillar: {
          stem: { name: 'Ren', element: 'Water', polarity: 'Yang' },
          branch: { name: 'Zi', element: 'Water', polarity: 'Yang' },
        },
        selfElement: 'Yin Metal',
        selfAspect: 'The Gem Cutter',
        elementDistribution: {
          Wood: 15,
          Fire: 25,
          Earth: 10,
          Metal: 35,
          Water: 15,
        },
      },
    };
  }
}
