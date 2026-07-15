import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { QueryClientProvider } from '@/lib/query-client'
import { RootLayout } from '@/components/layout/root-layout'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s — Meridian',
    default: 'Meridian — Personal Insight Reports',
  },
  description:
    'Know the pattern. Navigate the path. Personalized insight reports built on classical Chinese analytical frameworks.',
  keywords: [
    'bazi',
    'four pillars',
    'zi wei dou shu',
    'chinese astrology',
    'personal insight',
    'birth chart',
  ],
  authors: [{ name: 'Meridian' }],
  creator: 'Meridian',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Meridian',
    title: 'Meridian — Personal Insight Reports',
    description:
      'Know the pattern. Navigate the path. Personalized insight reports built on classical Chinese analytical frameworks.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meridian — Personal Insight Reports',
    description:
      'Know the pattern. Navigate the path. Personalized insight reports built on classical Chinese analytical frameworks.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
  // PWA manifest reference
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Merriweather:wght@300;400;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Merriweather:wght@300;400;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={['light', 'dark']}
        >
          <QueryClientProvider>
            <RootLayout>{children}</RootLayout>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
