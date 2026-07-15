'use client'

import * as React from 'react'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-meridian-ivory">
      {children}
    </div>
  )
}
