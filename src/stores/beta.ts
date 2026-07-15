'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BetaState } from '@/lib/beta/types';

interface BetaActions {
  /** Submit email to waitlist */
  requestInvite: (email: string, ref?: string) => Promise<void>;
  /** Verify and redeem an invite code */
  verifyCode: (code: string) => Promise<boolean>;
  /** Reset beta state */
  reset: () => void;
}

type BetaStore = BetaState & BetaActions;

const initialState: BetaState = {
  betaAccess: false,
  inviteCode: null,
  referrals: 0,
  waitlistPosition: null,
};

export const useBetaStore = create<BetaStore>()(
  persist(
    (set) => ({
      ...initialState,

      requestInvite: async (email: string, ref?: string) => {
        try {
          const res = await fetch('/api/beta/request-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, ref }),
          });
          const data = await res.json();

          if (data.success) {
            set({ waitlistPosition: data.position });
          }

          return data;
        } catch (error) {
          console.error('[Beta] requestInvite error:', error);
          throw error;
        }
      },

      verifyCode: async (code: string) => {
        try {
          const res = await fetch('/api/beta/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
          const data = await res.json();

          if (data.valid) {
            const trimmedCode = code.trim().toUpperCase();
            // Set localStorage flag for persistent access
            if (typeof window !== 'undefined') {
              localStorage.setItem('meridian-beta-access', 'true');
            }
            set({
              betaAccess: true,
              inviteCode: trimmedCode,
              waitlistPosition: null,
            });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[Beta] verifyCode error:', error);
          return false;
        }
      },

      reset: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('meridian-beta-access');
        }
        set(initialState);
      },
    }),
    {
      name: 'meridian-beta',
      partialize: (state) => ({
        betaAccess: state.betaAccess,
        inviteCode: state.inviteCode,
        referrals: state.referrals,
        waitlistPosition: state.waitlistPosition,
      }),
    },
  ),
);
