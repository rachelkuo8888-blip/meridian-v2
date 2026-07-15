'use client'

import { QueryClient, QueryClientProvider as QCP } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  )
  return <QCP client={queryClient}>{children}</QCP>
}
