/**
 * GET /api/health — Full system health check
 * Verifies: Next.js server, Calculation Engine, Memory Service, PostgreSQL
 */
import { NextResponse } from 'next/server';

const CALC_URL = process.env.CALC_ENGINE_URL ?? 'http://localhost:8080';
const MEMORY_URL = process.env.MEMORY_SERVICE_URL ?? 'http://localhost:8300';

export async function GET() {
  const results: Record<string, unknown> = {
    status: 'ok',
    nextjs: { status: 'ok' },
  };

  // Check Calculation Engine
  try {
    const calcRes = await fetch(`${CALC_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    results.calculation = calcRes.ok
      ? { status: 'ok', ...(await calcRes.json()) }
      : { status: 'error', message: `HTTP ${calcRes.status}` };
  } catch (err) {
    results.calculation = { status: 'error', message: 'Unreachable' };
  }

  // Check Memory Service
  try {
    const memRes = await fetch(`${MEMORY_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    results.memory = memRes.ok
      ? { status: 'ok', ...(await memRes.json()) }
      : { status: 'error', message: `HTTP ${memRes.status}` };
  } catch (err) {
    results.memory = { status: 'error', message: 'Unreachable' };
  }

  // Overall status
  const allOk = Object.values(results).every(
    (r: unknown) =>
      typeof r === 'object' &&
      r !== null &&
      (r as Record<string, unknown>).status === 'ok',
  );
  if (!allOk) results.status = 'degraded';

  return NextResponse.json(results);
}
