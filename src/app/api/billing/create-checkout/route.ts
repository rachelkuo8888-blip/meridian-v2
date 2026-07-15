/**
 * POST /api/billing/create-checkout
 *
 * Creates a Stripe Checkout Session for subscription purchase.
 * Accepts priceId, userId, and optional URLs.
 * Gracefully returns mock data if Stripe is not configured.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/billing/subscription'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, userId, successUrl, cancelUrl } = body

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, userId' },
        { status: 400 },
      )
    }

    const result = await createCheckoutSession({
      priceId,
      userId,
      successUrl,
      cancelUrl,
      trialPeriodDays: 7,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Billing] Create checkout error:', error)
    return NextResponse.json(
      { mock: true, message: 'Billing not configured', error: String(error) },
      { status: 200 },
    )
  }
}
