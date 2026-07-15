/**
 * POST /api/calc/chart — Proxy to Calculation Engine /chart
 */
import { NextRequest, NextResponse } from 'next/server';

const ENGINE_URL = process.env.CALC_ENGINE_URL ?? 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${ENGINE_URL}/chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
