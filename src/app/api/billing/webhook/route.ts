/**
 * POST /api/billing/webhook
 *
 * Stripe webhook endpoint for subscription lifecycle events.
 * Handles: checkout.session.completed, customer.subscription.updated,
 *          customer.subscription.deleted, customer.subscription.trial_will_end
 * Uses stripe.webhooks.constructEvent() for signature verification.
 * Never crashes — always returns 200.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getStripeAdmin } from '@/lib/billing/stripe'
import { handleWebhookEvent } from '@/lib/billing/subscription'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  const stripe = getStripeAdmin()
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    // Stripe not configured — acknowledge silently
    console.log('[Billing] Webhook received but Stripe not configured')
    return NextResponse.json({ received: true, mock: true })
  }

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.warn('[Billing] Webhook missing stripe-signature header')
      return NextResponse.json({ received: true })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Process webhook asynchronously — don't block response
    handleWebhookEvent(event).catch((err) => {
      console.error('[Billing] Webhook handler error:', err)
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Billing] Webhook verification error:', error)
    // Always return 200 — never fail the webhook
    return NextResponse.json({ received: true, error: 'verification failed' })
  }
}
