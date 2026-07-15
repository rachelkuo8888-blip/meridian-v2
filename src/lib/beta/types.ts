/**
 * Beta invite types
 */

export interface BetaState {
  /** Whether the user has beta access */
  betaAccess: boolean;
  /** User's invite code (if they have one) */
  inviteCode: string | null;
  /** Number of successful referrals */
  referrals: number;
  /** Position in the waitlist */
  waitlistPosition: number | null;
}

export interface RequestInviteResponse {
  success: boolean;
  position: number;
  message: string;
}

export interface VerifyCodeResponse {
  valid: boolean;
  message?: string;
}

export interface ReferralData {
  code: string;
  count: number;
}
