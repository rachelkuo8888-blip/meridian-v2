'use client';

import * as React from 'react';
import { useAnalyticsStore } from '@/lib/analytics/store';
import { Card } from '@/components/ui/card';

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-meridian-dust/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-meridian-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[7pt] text-meridian-dust flex-shrink-0 w-8 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const stats = useAnalyticsStore();
  const computeStats = useAnalyticsStore((s) => s.computeStats);

  React.useEffect(() => {
    computeStats();
  }, [computeStats]);

  return (
    <div className="min-h-screen bg-meridian-ivory">
      <main className="mx-auto max-w-md px-5 pt-8 pb-24 animate-page-in">
        <h1 className="font-serif text-[18px] text-meridian-ink font-light tracking-wide mb-6">
          Your Analytics
        </h1>

        {/* Metric cards — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="ivory" padding="sm" className="text-center">
            <p className="font-mono text-[28px] text-meridian-gold font-medium">
              {stats.totalDays}
            </p>
            <p className="font-sans text-[6px] font-bold tracking-[0.12em] uppercase text-meridian-dust mt-1">
              Days
            </p>
          </Card>
          <Card variant="ivory" padding="sm" className="text-center">
            <p className="font-mono text-[28px] text-meridian-gold font-medium">
              {stats.totalCheckins}
            </p>
            <p className="font-sans text-[6px] font-bold tracking-[0.12em] uppercase text-meridian-dust mt-1">
              Check-ins
            </p>
          </Card>
          <Card variant="ivory" padding="sm" className="text-center">
            <p className="font-mono text-[28px] text-meridian-gold font-medium">
              {stats.totalCoachMessages}
            </p>
            <p className="font-sans text-[6px] font-bold tracking-[0.12em] uppercase text-meridian-dust mt-1">
              Coach Msgs
            </p>
          </Card>
          <Card variant="ivory" padding="sm" className="text-center">
            <p className="font-mono text-[28px] text-meridian-gold font-medium">
              {stats.avgEnergyScore}
            </p>
            <p className="font-sans text-[6px] font-bold tracking-[0.12em] uppercase text-meridian-dust mt-1">
              Avg Energy
            </p>
          </Card>
        </div>

        {/* Activity — Weekly check-in bars */}
        <Card variant="ivory" padding="md" className="mt-4">
          <p className="font-sans text-[8px] font-bold tracking-[0.09em] uppercase text-meridian-black mb-4">
            Activity
          </p>
          <div className="space-y-3">
            {stats.weeklyCheckins.map((count, i) => {
              const weekLabel =
                i === 3
                  ? 'Current'
                  : `Week ${stats.weeklyCheckins.length - i}`;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-[8pt] text-meridian-ink">
                      {weekLabel}
                    </span>
                  </div>
                  <ProgressBar value={count} max={7} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Common Tags */}
        <Card variant="ivory" padding="md" className="mt-4">
          <p className="font-sans text-[8px] font-bold tracking-[0.09em] uppercase text-meridian-black mb-3">
            Common Tags
          </p>
          {stats.commonTags.length === 0 ? (
            <p className="font-sans text-[8pt] text-meridian-dust">
              No tags yet. Start checking in to see your patterns.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.commonTags.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="font-sans text-[8pt] text-meridian-gold"
                >
                  {tag} <span className="text-meridian-dust">({count})</span>
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Streaks */}
        <Card variant="ivory" padding="md" className="mt-4">
          <div className="flex gap-8">
            <div>
              <p className="font-sans text-[8px] font-bold tracking-[0.09em] uppercase text-meridian-dust mb-1">
                Best Streak
              </p>
              <p className="font-mono text-[18px] text-meridian-gold font-medium">
                {stats.bestStreak} days
              </p>
            </div>
            <div>
              <p className="font-sans text-[8px] font-bold tracking-[0.09em] uppercase text-meridian-dust mb-1">
                Current
              </p>
              <p className="font-mono text-[18px] text-meridian-gold font-medium">
                {stats.currentStreak} days
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
