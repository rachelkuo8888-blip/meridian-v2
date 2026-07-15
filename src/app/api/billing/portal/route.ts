/**
 * GET /api/billing/portal
 *
 * Creates a Stripe Customer Portal session for managing subscriptions.
 * Accepts customerId as query parameter.
 * Gracefully returns mock data if Stripe is not configured.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createPortalSession } from '@/lib/billing/subscription'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const returnUrl = searchParams.get('returnUrl') ?? undefined

    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing required query param: customerId' },
        { status: 400 },
      )
    }

    const result = await createPortalSession(customerId, returnUrl)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Billing] Create portal error:', error)
    return NextResponse.json(
      { mock: true, message: 'Billing not configured', error: String(error) },
      { status: 200 },
    )
  }
}
