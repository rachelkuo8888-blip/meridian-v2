import type { Metadata, Viewport } from 'next';
import { Inter, Merriweather, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@/lib/query-client';
import { RootLayout as AppShell } from '@/components/layout/root-layout';
import './globals.css';

// Google Fonts with next/font (self-hosted, no external requests)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
  weight: ['300', '400', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

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
  // PWA manifest reference
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${merriweather.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={['light', 'dark']}
        >
          <QueryClientProvider>
            <AppShell>{children}</AppShell>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
