'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Root layout shell for Meridian.
 * Provides the app container with proper background styling for light and dark modes.
 * Supports both ivory (default) and dark mode backgrounds per Brand Guide.
 */
export function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col',
        // Light mode: ivory background
        'bg-meridian-ivory text-meridian-black',
        // Dark mode: deep black background
        'dark:bg-surface-dark dark:text-meridian-ivory',
      )}
    >
      {/* Background texture overlay (subtle grid) — optional, for premium feel */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-meridian-black focus:px-4 focus:py-2 focus:text-meridian-ivory"
      >
        Skip to main content
      </a>

      {/* App content */}
      <main
        id="main-content"
        className="flex-1"
      >
        {children}
      </main>

      {/* Hidden analytics placeholder — activate when analytics tool is selected */}
      {mounted && process.env.NEXT_PUBLIC_ANALYTICS_ID && (
        <div id="analytics-placeholder" aria-hidden="true" />
      )}
    </div>
  )
}
