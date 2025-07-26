import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import './globals.css'
 
export const metadata: Metadata = {
  title: 'Solution Tech Chat',
  description: 'Chat-type application that allows users to make autonomous inquiries about the company.',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}