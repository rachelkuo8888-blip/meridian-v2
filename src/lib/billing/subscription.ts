/**
 * Subscription management functions — create, cancel, webhook handling.
 */
import Stripe from 'stripe'
import { getStripeAdmin } from './stripe'
import type { SubscriptionState } from './types'
import { env } from '@/lib/env'

/**
 * Create a Stripe Checkout Session for a new subscription.
 */
export async function createCheckoutSession(params: {
  priceId: string
  userId: string
  customerEmail?: string
  customerName?: string
  successUrl?: string
  cancelUrl?: string
  trialPeriodDays?: number
}): Promise<{ sessionUrl: string; sessionId: string } | { mock: true; message: string }> {
  const stripe = getStripeAdmin()
  if (!stripe) {
    return { mock: true, message: 'Billing not configured' }
  }

  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    client_reference_id: params.userId,
    customer_email: params.customerEmail,
    subscription_data: {
      trial_period_days: params.trialPeriodDays ?? 7,
      metadata: {
        userId: params.userId,
      },
    },
    success_url: params.successUrl ?? `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: params.cancelUrl ?? `${baseUrl}/pricing`,
  })

  if (!session.url || !session.id) {
    throw new Error('Failed to create checkout session')
  }

  return { sessionUrl: session.url, sessionId: session.id }
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl?: string,
): Promise<{ portalUrl: string } | { mock: true; message: string }> {
  const stripe = getStripeAdmin()
  if (!stripe) {
    return { mock: true, message: 'Billing not configured' }
  }

  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl ?? `${baseUrl}/pricing`,
  })

  return { portalUrl: session.url }
}

/**
 * Map Stripe subscription status to our SubscriptionStatus type.
 */
function mapSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionState['status'] {
  switch (status) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'canceled':
      return 'canceled'
    case 'past_due':
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
      return 'incomplete'
    default:
      return 'expired'
  }
}

/**
 * Determine plan tier from Stripe subscription data.
 */
function determinePlan(subscription: Stripe.Subscription): SubscriptionState['plan'] {
  const items = subscription.items.data
  if (!items || items.length === 0) return 'free'

  // Check product names/metadata to determine tier
  for (const item of items) {
    const productName = item.price.product as Stripe.Product
    if (typeof productName === 'string') {
      // If only price ID is available, check the price metadata
      if (item.price.nickname?.toLowerCase().includes('pro')) return 'pro'
      if (item.price.nickname?.toLowerCase().includes('plus')) return 'plus'
    } else if (productName && typeof productName === 'object') {
      const name = productName.name?.toLowerCase() ?? ''
      if (name.includes('pro')) return 'pro'
      if (name.includes('plus')) return 'plus'
    }
  }

  return 'plus' // Default paid tier
}

/**
 * Extract subscription state from a Stripe subscription object.
 */
export function extractSubscriptionState(
  subscription: Stripe.Subscription,
): SubscriptionState {
  return {
    plan: determinePlan(subscription),
    status: mapSubscriptionStatus(subscription.status),
    trialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : undefined,
    currentPeriodEnd: subscription.billing_cycle_anchor
      ? new Date(subscription.billing_cycle_anchor * 1000).toISOString()
      : undefined,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    customerId: typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id,
  }
}

/**
 * Handle Stripe webhook event.
 */
export async function handleWebhookEvent(
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('[Billing] Checkout completed:', {
        sessionId: session.id,
        customerId: session.customer,
        userId: session.client_reference_id,
        subscriptionId: session.subscription,
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const state = extractSubscriptionState(subscription)
      console.log('[Billing] Subscription updated:', {
        subscriptionId: subscription.id,
        plan: state.plan,
        status: state.status,
        customerId: state.customerId,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      console.log('[Billing] Subscription deleted:', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      })
      break
    }

    case 'customer.subscription.trial_will_end': {
      const subscription = event.data.object as Stripe.Subscription
      console.log('[Billing] Trial ending soon:', {
        subscriptionId: subscription.id,
        trialEnd: subscription.trial_end,
      })
      break
    }

    default:
      console.log('[Billing] Unhandled event type:', event.type)
  }
}

/**
 * Get a free-tier subscription state (default for unauthenticated/free users).
 */
export function getFreeSubscriptionState(): SubscriptionState {
  return {
    plan: 'free',
    status: 'active',
  }
}
