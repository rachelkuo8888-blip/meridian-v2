/**
 * GET /api/coach/messages
 *
 * Returns recent coach messages for a user.
 * Query params: userId (required), limit (optional, default 20)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCoachMessages } from '@/lib/coach/context-assembler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? Math.min(parseInt(limitStr, 10) || 20, 100) : 20;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid userId query parameter' },
        { status: 400 },
      );
    }

    const messages = await getCoachMessages(userId, limit);

    return NextResponse.json({
      messages,
      total: messages.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Coach Messages] Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
