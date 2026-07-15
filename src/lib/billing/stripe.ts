/**
 * Stripe SDK client initialization.
 *
 * Provides both public (publishable key) and admin (secret key) Stripe instances.
 * Both gracefully handle missing env vars — never crash.
 */
import Stripe from 'stripe'
import { env } from '@/lib/env'

let stripePromise: Stripe | null = null
let stripeAdminPromise: Stripe | null = null

/**
 * Stripe instance for client-side operations (uses publishable key).
 * Returns null if not configured.
 */
export function getStripe(): Stripe | null {
  if (stripePromise) return stripePromise

  const publishableKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    return null
  }

  stripePromise = new Stripe(publishableKey, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  })

  return stripePromise
}

/**
 * Stripe instance for server-side admin operations (uses secret key).
 * Returns null if not configured.
 */
export function getStripeAdmin(): Stripe | null {
  if (stripeAdminPromise) return stripeAdminPromise

  const secretKey = env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return null
  }

  stripeAdminPromise = new Stripe(secretKey, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  })

  return stripeAdminPromise
}

/**
 * Check if Stripe is fully configured (both keys present).
 */
export function isStripeConfigured(): boolean {
  return !!(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && env.STRIPE_SECRET_KEY)
}
