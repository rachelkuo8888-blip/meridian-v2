'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { usePageView } from '@/hooks/use-page-view';

const CoachChatInput = dynamic(() => import('@/components/coach/chat-input').then((m) => ({ default: m.CoachChatInput })), { ssr: false });

// ─── Sample entries ───

const SAMPLE_ENTRIES: Array<{
  id: number;
  date: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
}> = [
  {
    id: 1,
    date: 'July 14, 2026',
    role: 'user',
    text: '帮我解读一下今天',
    time: '08:12',
  },
  {
    id: 2,
    date: 'July 14, 2026',
    role: 'ai',
    text: '今天日柱为壬水，与流年形成「水火既济」之势。上午（巳时）能量曲线处于高位，特别适合推进需要专注的工作事项。下午能量趋于平缓，建议安排常规性事务或会议。晚间（戌时）有贵人运迹象，适合社交或合作洽谈。\n\n注意：申时（15:00–17:00）可能感到注意力分散，建议安排15分钟短暂休息。',
    time: '08:12',
  },
  {
    id: 3,
    date: 'July 13, 2026',
    role: 'user',
    text: '这一周整体怎么样',
    time: '20:30',
  },
  {
    id: 4,
    date: 'July 13, 2026',
    role: 'ai',
    text: '本周土气旺盛，利于长期规划与结构性思考。周二周三是能量高峰，适合做重要决策。周五前后注意情绪波动，行事宜缓。',
    time: '20:30',
  },
];

// ─── Components ───

function AIChatBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex gap-3 mb-5">
      <div className="w-0.5 flex-shrink-0 rounded-full bg-meridian-gold" />
      <div className="flex-1 min-w-0">
        <p className="font-serif text-sm text-meridian-ink leading-relaxed whitespace-pre-line">
          {text}
        </p>
        <span
          className="font-mono text-meridian-dust mt-1.5 block"
          style={{ fontSize: 7 }}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

function UserChatBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-end mb-5">
      <div className="max-w-[80%]">
        <div className="bg-meridian-ink text-meridian-ivory rounded-xl rounded-br-sm px-4 py-3">
          <p className="font-sans text-sm leading-relaxed">{text}</p>
        </div>
        <span
          className="font-mono text-meridian-dust mt-1 block text-right"
          style={{ fontSize: 7 }}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

// ─── Inner content (needs Suspense for useSearchParams) ───

function CoachContent() {
  usePageView('coach');
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  return (
    <div className="min-h-screen bg-meridian-ivory flex flex-col">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-serif text-[18px] text-meridian-ink font-light tracking-wide">
          Coach
        </h1>
      </header>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {SAMPLE_ENTRIES.reduce<
          Array<{ date: string; entries: typeof SAMPLE_ENTRIES }>
        >((groups, entry) => {
          const last = groups[groups.length - 1];
          if (last && last.date === entry.date) {
            last.entries.push(entry);
          } else {
            groups.push({ date: entry.date, entries: [entry] });
          }
          return groups;
        }, [])
          .map((group) => (
            <div key={group.date} className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-meridian-dust/20" />
                <span
                  className="font-mono text-meridian-dust flex-shrink-0"
                  style={{ fontSize: 7, letterSpacing: '0.05em' }}
                >
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-meridian-dust/20" />
              </div>

              <div className="space-y-3">
                {group.entries.map((entry) =>
                  entry.role === 'ai' ? (
                    <AIChatBubble key={entry.id} text={entry.text} time={entry.time} />
                  ) : (
                    <UserChatBubble key={entry.id} text={entry.text} time={entry.time} />
                  ),
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Input bar — lazy loaded */}
      <React.Suspense fallback={<div className="sticky bottom-0 px-5 py-4" />}>
        <CoachChatInput initialQuery={initialQuery} />
      </React.Suspense>
    </div>
  );
}

// ─── Page wrapper with Suspense ───

export default function CoachPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-meridian-ivory" />}>
      <CoachContent />
    </React.Suspense>
  );
}
