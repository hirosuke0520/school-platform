import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/contexts/ToastContext'
import NextAuthSessionProvider from '@/components/SessionProvider'
import { SessionProvider } from '@/contexts/SessionContext'
import SessionManager from '@/components/SessionManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Code Strategy - プログラミング学習プラットフォーム',
  description: 'プログラミング初心者向けの学習プラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <SessionProvider>
            <ToastProvider>
              <SessionManager />
              {children}
            </ToastProvider>
          </SessionProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}