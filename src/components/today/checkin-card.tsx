'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useCheckinStore, type Mood, type Tag, MOOD_TAGS } from '@/stores/checkin';

interface CheckinCardProps {
  className?: string;
}

const MOODS: { value: Mood; label: string }[] = [
  { value: 1, label: 'Terrible' },
  { value: 2, label: 'Bad' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
];

/** Simple SVG face for a given mood value (1–5) */
function MoodFace({
  mood,
  selected,
}: {
  mood: Mood;
  selected: boolean;
}) {
  const fill = selected ? '#2C2A26' : 'none';
  const stroke = selected ? '#2C2A26' : '#B8B4AC';
  const strokeWidth = 1.5;

  // Eye expressions and mouth differ per mood
  const leftEye = mood <= 2 ? 'M10 10 L13 12' : mood === 3 ? 'M10 11 L13 11' : 'M10 12 L13 10';
  const rightEye = mood <= 2 ? 'M17 10 L20 12' : mood === 3 ? 'M17 11 L20 11' : 'M17 12 L20 10';
  const mouth =
    mood === 1
      ? 'M11 18 Q15 15 19 18'
      : mood === 2
        ? 'M11 17 Q15 15.5 19 17'
        : mood === 3
          ? 'M11 17 Q15 18 19 17'
          : mood === 4
            ? 'M11 16 Q15 20 19 16'
            : 'M11 15 Q15 21 19 15';

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Face circle */}
      <circle cx="15" cy="15" r="13" />

      {/* Eyes */}
      <path d={leftEye} />
      <path d={rightEye} />

      {/* Mouth */}
      <path d={mouth} fill="none" />
    </svg>
  );
}

/**
 * Check-in Card — "How are you today?" with 5 mood options.
 * On selection, expands to show tag multi-select.
 * Auto-collapses when tags are selected.
 */
export function CheckinCard({ className }: CheckinCardProps) {
  const today = useCheckinStore((s) => s.getToday());
  const setMood = useCheckinStore((s) => s.setMood);
  const toggleTag = useCheckinStore((s) => s.toggleTag);

  const selectedMood = today.mood;
  const selectedTags = today.tags;
  const completed = today.completed;

  const phase: 'initial' | 'mood-selected' | 'tags-done' = React.useMemo(() => {
    if (completed) return 'tags-done';
    if (selectedMood !== null) return 'mood-selected';
    return 'initial';
  }, [completed, selectedMood]);

  const handleMoodSelect = (mood: Mood) => {
    setMood(mood);
  };

  const handleTagToggle = (tag: Tag) => {
    toggleTag(tag);
  };

  // If check-in is done, collapse
  if (completed && phase === 'tags-done') {
    return null;
  }

  const availableTags = selectedMood ? MOOD_TAGS[selectedMood] ?? [] : [];

  return (
    <div
      className={cn(
        'bg-surface border rounded-xl px-5 py-4',
        'border-meridian-dust/30',
        className,
      )}
    >
      {/* Prompt */}
      <p className="font-sans text-sm text-meridian-ink mb-4 font-medium">
        How are you today?
      </p>

      {/* Mood buttons */}
      <div className="flex items-center justify-between gap-2">
        {MOODS.map(({ value, label }) => {
          const isSelected = selectedMood === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleMoodSelect(value)}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-200',
                'focus:outline-none',
                isSelected && 'scale-110',
              )}
              aria-label={label}
              aria-pressed={isSelected}
            >
              <MoodFace mood={value} selected={isSelected} />
              <span
                className={cn(
                  'font-sans text-[8px] tracking-wider',
                  isSelected ? 'text-meridian-ink font-medium' : 'text-meridian-dust',
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tag selector — expand when mood is selected */}
      {phase === 'mood-selected' && !completed && (
        <div className="mt-4 pt-4 border-t border-meridian-dust/20 animate-slide-up">
          <p className="font-sans text-xs text-meridian-dust mb-3">
            What are you feeling?
          </p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-[10px] font-sans transition-all duration-200',
                    'border focus:outline-none',
                    isActive
                      ? 'bg-meridian-ink text-meridian-ivory border-meridian-ink'
                      : 'bg-transparent text-meridian-dust border-meridian-dust/40 hover:border-meridian-dust',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
