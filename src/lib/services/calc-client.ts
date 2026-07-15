/**
 * Calculation Engine HTTP client.
 * Talks to the Python microservice at services/calculation/server.py
 */

const ENGINE_URL = process.env.CALC_ENGINE_URL ?? 'http://localhost:8080';

interface CalcHealthResponse {
  status: string;
  engine: string;
  timestamp: string;
}

interface GenerateChartInput {
  user_id: string;
  birth_date: string; // "YYYY-MM-DD"
  birth_hour?: string; // "HH:MM"
  longitude?: number;
  timezone_std_longitude?: number; // default 120.0 (UTC+8)
  gender?: string;
}

interface DailyEnergyInput {
  natal_chart: unknown; // Full NatalChart JSON
  target_date: string; // "YYYY-MM-DD"
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  const url = `${ENGINE_URL}${path}`;
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`CalcEngine ${path}: ${err.error ?? res.status}`);
  }

  return res.json();
}

export const calcClient = {
  health: () => request<CalcHealthResponse>('/health'),

  generateChart: (input: GenerateChartInput) =>
    request<{ status: string; data: Record<string, unknown> }>('/chart', input),

  dailyEnergy: (input: DailyEnergyInput) =>
    request<{
      status: string;
      target_date: string;
      today_pillar: { stem: string; branch: string };
      score: number;
    }>('/daily-energy', input),
};
