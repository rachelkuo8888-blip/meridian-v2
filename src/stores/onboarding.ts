'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BirthTimeConfidence = 'exact' | 'morning' | 'afternoon' | 'evening' | 'night' | 'skip';

export interface OnboardingState {
  // Screen tracking
  currentScreen: number;
  onboardingCompleted: boolean;

  // Birth data
  birthDate: string | null;
  birthTime: string | null;
  birthTimeConfidence: BirthTimeConfidence | null;
  birthLocation: string | null;
  longitude: number | null;
  latitude: number | null;
  timezone: string | null;

  // Actions
  setCurrentScreen: (screen: number) => void;
  setBirthDate: (date: string) => void;
  setBirthTime: (time: string) => void;
  setBirthTimeConfidence: (confidence: BirthTimeConfidence) => void;
  setBirthLocation: (location: string) => void;
  setCoordinates: (lng: number, lat: number) => void;
  setTimezone: (tz: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentScreen: 0,
      onboardingCompleted: false,

      birthDate: null,
      birthTime: null,
      birthTimeConfidence: null,
      birthLocation: null,
      longitude: null,
      latitude: null,
      timezone: null,

      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setBirthDate: (date) => set({ birthDate: date }),
      setBirthTime: (time) => set({ birthTime: time }),
      setBirthTimeConfidence: (confidence) => set({ birthTimeConfidence: confidence }),
      setBirthLocation: (location) => set({ birthLocation: location }),
      setCoordinates: (lng, lat) => set({ longitude: lng, latitude: lat }),
      setTimezone: (tz) => set({ timezone: tz }),
      completeOnboarding: () => set({ onboardingCompleted: true, currentScreen: 99 }),
      reset: () =>
        set({
          currentScreen: 0,
          onboardingCompleted: false,
          birthDate: null,
          birthTime: null,
          birthTimeConfidence: null,
          birthLocation: null,
          longitude: null,
          latitude: null,
          timezone: null,
        }),
    }),
    {
      name: 'meridian-onboarding',
      partialize: (state) => ({
        birthDate: state.birthDate,
        birthTime: state.birthTime,
        birthTimeConfidence: state.birthTimeConfidence,
        birthLocation: state.birthLocation,
        longitude: state.longitude,
        latitude: state.latitude,
        timezone: state.timezone,
        onboardingCompleted: state.onboardingCompleted,
      }),
    },
  ),
);
