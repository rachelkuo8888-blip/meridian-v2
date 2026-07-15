/**
 * GET /api/calc/health — Proxy to Calculation Engine /health
 */
import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.CALC_ENGINE_URL ?? 'http://localhost:8080';

export async function GET() {
  try {
    const res = await fetch(`${ENGINE_URL}/health`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Calculation Engine unreachable' },
      { status: 503 },
    );
  }
}
