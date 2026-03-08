import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="ko">
      <head>
        <style>{`
          :root {
            --font-apple: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Helvetica Neue', sans-serif;
          }
        `}</style>
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: 'var(--font-apple)' }}>
        {children}
      </body>
    </html>
  )
}
