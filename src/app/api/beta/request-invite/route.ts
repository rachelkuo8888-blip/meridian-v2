import { NextRequest, NextResponse } from 'next/server';
import { isValidFormat } from '@/lib/beta/invite';

/**
 * In-memory storage for waitlist (MVP).
 * In production, this would be a database.
 */
const waitlist: string[] = [];

/**
 * Simple in-memory referral counter (MVP).
 * Maps invite codes to referral counts.
 */
const referrals: Record<string, number> = {};

/**
 * POST /api/beta/request-invite
 *
 * Submit email to beta waitlist.
 * Optionally include a referral code (ref).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, ref } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, position: 0, message: 'Email is required' },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, position: 0, message: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already on waitlist
    const existingIndex = waitlist.indexOf(normalizedEmail);
    if (existingIndex !== -1) {
      return NextResponse.json({
        success: true,
        position: existingIndex + 1,
        message: 'You are already on the waitlist!',
      });
    }

    // Add to waitlist
    waitlist.push(normalizedEmail);

    // If referred by a valid code, increment referrer's count
    if (ref && typeof ref === 'string' && isValidFormat(ref)) {
      if (!referrals[ref]) {
        referrals[ref] = 0;
      }
      referrals[ref]++;
    }

    const position = waitlist.length;

    return NextResponse.json({
      success: true,
      position,
      message: `You're #${position} on the waitlist. We'll notify you when it's your turn!`,
    });
  } catch (error) {
    console.error('[Beta] request-invite error:', error);
    return NextResponse.json(
      { success: false, position: 0, message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

/**
 * Get waitlist size (used for testing/display)
 */
export function getWaitlistSize(): number {
  return waitlist.length;
}

/**
 * Get referral count for a specific code
 */
export function getReferralCount(code: string): number {
  return referrals[code] || 0;
}
