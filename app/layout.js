import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export const metadata = {
  title: 'AI Platform - Production-Grade AI Workspace',
  description: 'Comprehensive AI platform with 10 modules: Chat, Technical, File Analytics, Create, Info, News, AIs, System Usage, Companies, and ML/DL Lab',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}