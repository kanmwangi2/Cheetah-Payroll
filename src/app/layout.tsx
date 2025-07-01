import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/use-auth'
import { CompanyProvider } from '@/hooks/use-company'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cheetah Payroll',
  description: 'Modern payroll management system for Rwandan companies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <CompanyProvider>
            {children}
            <Toaster richColors />
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
