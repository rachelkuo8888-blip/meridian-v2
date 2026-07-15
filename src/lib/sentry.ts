import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a Next.js API route handler with Sentry error reporting.
 * Falls back to console.error if Sentry DSN is not configured.
 */
export function withErrorReporting(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(error);
      } else {
        console.error('[Error]', error);
      }
      throw error;
    }
  };
}
