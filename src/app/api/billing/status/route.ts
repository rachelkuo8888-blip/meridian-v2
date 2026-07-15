/**
 * GET /api/billing/status?userId=xxx
 *
 * Returns the current subscription status for the specified user.
 * For MVP, returns free plan by default (graceful degradation when
 * database lookup is not yet connected).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getFreeSubscriptionState } from '@/lib/billing/subscription'
import { getStripeAdmin } from '@/lib/billing/stripe'
import type { SubscriptionState } from '@/lib/billing/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required query param: userId' },
        { status: 400 },
      )
    }

    const stripe = getStripeAdmin()

    if (!stripe) {
      // Stripe not configured — return free plan
      return NextResponse.json(getFreeSubscriptionState())
    }

    // Try to look up subscription from a connected customer
    // For MVP, check if we have a customer record and active subscription
    try {
      // In production, this would query a DB mapping userId → customerId
      // and then fetch subscription state from Stripe
      // For now, return free plan
      const state: SubscriptionState = {
        ...getFreeSubscriptionState(),
      }
      return NextResponse.json(state)
    } catch {
      return NextResponse.json(getFreeSubscriptionState())
    }
  } catch (error) {
    console.error('[Billing] Status error:', error)
    return NextResponse.json(getFreeSubscriptionState())
  }
}
