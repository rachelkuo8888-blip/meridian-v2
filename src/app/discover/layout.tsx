'use client'

import * as React from 'react'

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Discover — Meridian',
            description:
              'Articles about Chinese metaphysics, Ba Zi, Zi Wei Dou Shu, and seasonal insights.',
            url: 'https://meridian.app/discover',
          }),
        }}
      />
      {children}
    </>
  )
}
