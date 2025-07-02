'use client'

// Force dynamic rendering to prevent static pre-rendering issues with Supabase
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Company } from '@/types'
import { db } from '@/lib/supabase'

export default function SelectCompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const { user, setSelectedCompany, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    loadCompanies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router])

  const loadCompanies = async () => {
    if (!user) return

    try {
      // Get companies the user has access to
      const companyIds = user.roles.map(role => role.companyId)
      const isGlobalAdmin = user.roles.some(role => 
        ['primary_admin', 'app_admin'].includes(role.role)
      )

      let companies: Company[]
      
      if (isGlobalAdmin) {
        const { data } = await db.select('companies', {
          select: '*',
          order: { column: 'name', ascending: true }
        })
        companies = data || []
      } else {
        const { data } = await db.select('companies', {
          select: '*',
          filters: { id: { in: companyIds } },
          order: { column: 'name', ascending: true }
        })
        companies = data || []
      }

      setCompanies(companies)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company.id)
    router.push('/app/dashboard')
  }

  const handleSettings = () => {
    router.push('/settings/application')
  }

  const isGlobalAdmin = user?.roles.some(role => 
    ['primary_admin', 'app_admin'].includes(role.role)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Select Company</h1>
            <p className="text-muted-foreground">
              Choose a company to manage payroll and HR tasks
            </p>
          </div>
          <div className="flex gap-2">
            {isGlobalAdmin && (
              <Button variant="outline" onClick={handleSettings}>
                Application Settings
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card 
              key={company.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCompanySelect(company)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{company.name}</CardTitle>
                <CardDescription>
                  {company.description || 'Business type not specified'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {company.tinNumber && (
                    <div>TIN: {company.tinNumber}</div>
                  )}
                  {company.email && (
                    <div>Email: {company.email}</div>
                  )}
                  {company.phoneNumber && (
                    <div>Phone: {company.phoneNumber}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                No companies available. Contact your administrator for access.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
