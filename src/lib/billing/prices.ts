/**
 * Price IDs and product configuration constants.
 *
 * All price IDs should be set via environment variables for production.
 * Placeholder defaults are provided for local development without Stripe.
 */

export const PRICES = {
  plus_monthly: {
    priceId: process.env.STRIPE_PLUS_MONTHLY_PRICE_ID ?? 'price_plus_monthly_dev',
    amount: 14.99,
    interval: 'month' as const,
    label: 'Plus Monthly',
  },
  plus_yearly: {
    priceId: process.env.STRIPE_PLUS_YEARLY_PRICE_ID ?? 'price_plus_yearly_dev',
    amount: 99,
    interval: 'year' as const,
    label: 'Plus Annual',
  },
  pro_monthly: {
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? 'price_pro_monthly_dev',
    amount: 29.99,
    interval: 'month' as const,
    label: 'Pro Monthly',
  },
  pro_yearly: {
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? 'price_pro_yearly_dev',
    amount: 199,
    interval: 'year' as const,
    label: 'Pro Annual',
  },
} as const

export type PriceKey = keyof typeof PRICES
export type PriceEntry = (typeof PRICES)[PriceKey]

/**
 * Returns the annual equivalent monthly price for comparison display.
 */
export function annualEquivalentMonthly(priceKey: PriceKey): number {
  const price = PRICES[priceKey]
  if (price.interval === 'year') {
    return Math.round((price.amount / 12) * 100) / 100
  }
  return price.amount
}

/**
 * Returns the savings percentage when comparing monthly vs annual for the same tier.
 */
export function annualSavingsPercent(tier: 'plus' | 'pro'): number {
  const monthly = PRICES[`${tier}_monthly` as PriceKey].amount
  const yearly = PRICES[`${tier}_yearly` as PriceKey].amount
  const annualMonthlyCost = yearly / 12
  const savings = ((monthly - annualMonthlyCost) / monthly) * 100
  return Math.round(savings)
}
