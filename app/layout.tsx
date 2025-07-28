import type { Metadata } from 'next'
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/providers/ThemeProvider"
import './globals.css'
 
export const metadata: Metadata = {
  title: 'Solution Tech Chat',
  description: 'Chat-type application that allows users to make autonomous inquiries about the company.',
  icons: {
    icon: '/favicon.ico',
  }
}

const inter = Inter({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}