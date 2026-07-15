/**
 * Billing-specific types for Meridian subscription management.
 */

export type SubscriptionPlan = 'free' | 'plus' | 'pro'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'expired'
  | 'incomplete'

export interface PriceConfig {
  priceId: string
  amount: number
  interval: 'month' | 'year'
}

export interface SubscriptionState {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  trialEnd?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  customerId?: string
}

export interface CheckoutSessionResponse {
  sessionUrl: string
  sessionId: string
}

export interface MockResponse {
  mock: true
  message: string
}

export interface PortalResponse {
  portalUrl: string
}
