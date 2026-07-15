/**
 * GET /api/memory — Memory Service health/stats
 */
import { NextRequest, NextResponse } from 'next/server';

const MEMORY_URL = process.env.MEMORY_SERVICE_URL ?? 'http://localhost:8300';

export async function GET(req: NextRequest) {
  const path = new URL(req.url).searchParams.get('path') ?? 'health';
  try {
    const res = await fetch(`${MEMORY_URL}/${path}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Memory Service unreachable' },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint = body._endpoint ?? 'working';
    delete body._endpoint;

    const res = await fetch(`${MEMORY_URL}/memory/${endpoint}`, {
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
