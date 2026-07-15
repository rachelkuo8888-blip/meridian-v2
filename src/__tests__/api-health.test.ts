/**
 * BFF API Health tests — validates route structure compiles + returns expected shape.
 * Full integration tests require local Python services running.
 */
import { describe, it, expect } from 'vitest';

describe('API routes (compile-time)', () => {
  it('should export POST handler from calc/chart', async () => {
    const mod = await import('@/app/api/calc/chart/route');
    expect(mod.POST).toBeDefined();
    expect(typeof mod.POST).toBe('function');
  });

  it('should export GET handler from calc/health', async () => {
    const mod = await import('@/app/api/calc/health/route');
    expect(mod.GET).toBeDefined();
    expect(typeof mod.GET).toBe('function');
  });

  it('should export POST handler from calc/daily-energy', async () => {
    const mod = await import('@/app/api/calc/daily-energy/route');
    expect(mod.POST).toBeDefined();
    expect(typeof mod.POST).toBe('function');
  });

  it('should export GET and POST from memory', async () => {
    const mod = await import('@/app/api/memory/route');
    expect(mod.GET).toBeDefined();
    expect(mod.POST).toBeDefined();
  });

  it('should export GET from health', async () => {
    const mod = await import('@/app/api/health/route');
    expect(mod.GET).toBeDefined();
  });
});
