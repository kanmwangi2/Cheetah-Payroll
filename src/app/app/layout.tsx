'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCompany } from '@/hooks/use-company'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, signOut } = useAuth()
  const { company } = useCompany()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    if (!company) {
      router.push('/select-company')
      return
    }
  }, [user, company, router])

  const navigation = [
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      icon: '📊'
    },
    {
      name: 'Staff',
      href: '/app/staff', 
      icon: '👥'
    },
    {
      name: 'Payments',
      href: '/app/payments',
      icon: '💰'
    },
    {
      name: 'Deductions',
      href: '/app/deductions',
      icon: '📉'
    },
    {
      name: 'Payroll',
      href: '/app/payroll',
      icon: '📋'
    },
    {
      name: 'Reports',
      href: '/app/reports',
      icon: '📄'
    }
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleCompanyChange = () => {
    router.push('/select-company')
  }

  const handleProfileSettings = () => {
    router.push('/app/settings/profile')
  }

  const handleCompanySettings = () => {
    router.push('/app/settings/company')
  }

  if (!user || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-primary">Cheetah Payroll</h1>
            <p className="text-sm text-muted-foreground">{company.name}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleCompanySettings}
            >
              ⚙️ Company Settings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleProfileSettings}
            >
              👤 Profile Settings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleCompanyChange}
            >
              🏢 Change Company
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Top header */}
        <header className="bg-card border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </Button>
              <div>
                <h2 className="font-semibold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {user.profile?.firstName} {user.profile?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                🔔
              </Button>
              <Button variant="ghost" size="icon" onClick={handleProfileSettings}>
                👤
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
