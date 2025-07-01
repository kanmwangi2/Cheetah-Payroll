'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Building, Cog, Shield } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()

  const settingsOptions = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal account information and preferences',
      icon: User,
      href: '/app/settings/profile'
    },
    {
      title: 'Company Settings',
      description: 'Configure your company information and details',
      icon: Building,
      href: '/app/settings/company'
    },
    {
      title: 'System Settings',
      description: 'System-wide configuration and preferences',
      icon: Cog,
      href: '/app/settings/system',
      disabled: true
    },
    {
      title: 'Security Settings',
      description: 'Security and access control settings',
      icon: Shield,
      href: '/app/settings/security',
      disabled: true
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsOptions.map((option) => (
          <Card key={option.href} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <option.icon className="h-6 w-6 text-primary" />
                <span>{option.title}</span>
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push(option.href)}
                disabled={option.disabled}
                className="w-full"
              >
                {option.disabled ? 'Coming Soon' : 'Configure'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
