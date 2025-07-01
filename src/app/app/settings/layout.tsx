'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Building, Cog, Shield } from 'lucide-react'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const settingsNavigation = [
    {
      name: 'Profile',
      href: '/app/settings/profile',
      icon: User,
      description: 'Manage your personal account settings'
    },
    {
      name: 'Company',
      href: '/app/settings/company',
      icon: Building,
      description: 'Configure company settings and information'
    },
    {
      name: 'System',
      href: '/app/settings/system',
      icon: Cog,
      description: 'System-wide configuration and preferences'
    },
    {
      name: 'Security',
      href: '/app/settings/security',
      icon: Shield,
      description: 'Security and access control settings'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, company, and system preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          {settingsNavigation.map((item) => (
            <Card 
              key={item.href}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                pathname === item.href ? 'border-primary bg-muted/50' : ''
              }`}
              onClick={() => router.push(item.href)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}
