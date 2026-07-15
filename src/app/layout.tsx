import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { QueryClientProvider } from '@/lib/query-client'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meridian — Personal Insight Reports',
  description: 'Know the pattern. Navigate the path.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
