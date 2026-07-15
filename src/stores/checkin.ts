'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Mood = 1 | 2 | 3 | 4 | 5;

export const MOOD_LABELS: Record<Mood, string> = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

// Tags shown after mood selection — mood-specific subsets
export const MOOD_TAGS: Record<Mood, Tag[]> = {
  1: ['anxious', 'stressed', 'tired'],
  2: ['tired', 'stressed'],
  3: ['neutral', 'calm'],
  4: ['focused', 'calm', 'hopeful'],
  5: ['excited', 'focused', 'hopeful'],
};

export const ALL_TAGS = [
  'anxious',
  'tired',
  'excited',
  'focused',
  'calm',
  'stressed',
  'hopeful',
  'neutral',
] as const;

export type Tag = (typeof ALL_TAGS)[number];

export interface DailyCheckin {
  date: string; // ISO date string "YYYY-MM-DD"
  mood: Mood | null;
  tags: Tag[];
  completed: boolean;
}

interface CheckinState {
  checkins: Record<string, DailyCheckin>;
  setMood: (mood: Mood) => void;
  toggleTag: (tag: Tag) => void;
  getToday: () => DailyCheckin;
  resetToday: () => void;
}

function getTodayKey(): string {
  const d = new Date();
  // local date string in YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const emptyCheckin = (): DailyCheckin => ({
  date: getTodayKey(),
  mood: null,
  tags: [],
  completed: false,
});

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set, get) => ({
      checkins: {},

      setMood: (mood: Mood) => {
        const todayKey = getTodayKey();
        set((state) => ({
          checkins: {
            ...state.checkins,
            [todayKey]: {
              date: todayKey,
              mood,
              tags: state.checkins[todayKey]?.tags ?? [],
              completed: false,
            },
          },
        }));
      },

      toggleTag: (tag: Tag) => {
        const todayKey = getTodayKey();
        set((state) => {
          const current = state.checkins[todayKey] ?? emptyCheckin();
          const tags = current.tags.includes(tag)
            ? current.tags.filter((t) => t !== tag)
            : [...current.tags, tag];

          const mood = current.mood ?? 3;

          // Auto-complete when tags selected
          const completed = tags.length > 0;

          return {
            checkins: {
              ...state.checkins,
              [todayKey]: { ...current, tags, mood, completed },
            },
          };
        });
      },

      getToday: () => {
        return get().checkins[getTodayKey()] ?? emptyCheckin();
      },

      resetToday: () => {
        const todayKey = getTodayKey();
        set((state) => {
          const newCheckins = { ...state.checkins };
          delete newCheckins[todayKey];
          return { checkins: newCheckins };
        });
      },
    }),
    {
      name: 'meridian-checkin',
      partialize: (state) => ({ checkins: state.checkins }),
    },
  ),
);
