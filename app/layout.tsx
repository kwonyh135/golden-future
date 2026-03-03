import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKr = Noto_Sans_KR({ 
  subsets: ['latin', 'korean'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-kr'
});

export const metadata: Metadata = {
  title: '금빛 미래 · Golden Future',
  description: 'Couple investment portfolio dashboard for 용 & 령 — Korean stocks, US stocks, and crypto.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <head>
        <style>{`
          :root {
            --font-apple-sd: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Helvetica Neue', sans-serif;
          }
        `}</style>
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: 'var(--font-apple-sd)' }}>
        {children}
      </body>
    </html>
  )
}
