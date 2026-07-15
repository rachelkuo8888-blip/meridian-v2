import { NextRequest, NextResponse } from 'next/server';
import { validateServerCode, isValidFormat } from '@/lib/beta/invite';

/**
 * In-memory map of used codes (to prevent reuse if needed)
 * For MVP we allow reuse — each code can be used by multiple users.
 */
const usedCodes = new Set<string>();

/**
 * POST /api/beta/verify-code
 *
 * Verify an invite code.
 * For MVP: built-in codes (MER-DEMO, MER-TEST, MER-BETA, MER-ALPHA) always work.
 * Also accepts any code stored via admin flow.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Invite code is required' },
        { status: 400 },
      );
    }

    const trimmedCode = code.trim().toUpperCase();

    // Validate format
    if (!isValidFormat(trimmedCode)) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid code format. Expected format: MER-XXXX',
      });
    }

    // Check if code is valid
    const isValid = validateServerCode(trimmedCode);
    if (!isValid) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid invite code',
      });
    }

    // Track usage
    usedCodes.add(trimmedCode);

    return NextResponse.json({
      valid: true,
      message: 'Welcome to the Meridian Beta!',
    });
  } catch (error) {
    console.error('[Beta] verify-code error:', error);
    return NextResponse.json(
      { valid: false, message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
