'use client'

// Force dynamic rendering to prevent static pre-rendering issues with Supabase
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCompany } from '@/hooks/use-company'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats, PayrollRun } from '@/types'
import { db } from '@/lib/supabase-enhanced'
import { objectToCamelCase } from '@/lib/case-converter'
import { formatCurrency, getMonthName } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { company } = useCompany()

  useEffect(() => {
    if (company) {
      loadDashboardStats()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company])

  const loadDashboardStats = async () => {
    if (!company) return

    try {
      // Get total active employees
      const { data: allStaff } = await db.select('staffMembers', {
        select: '*',
        filters: { companyId: company.id, status: 'active' }
      })
      const totalActiveEmployees = allStaff?.length || 0

      // Get next payroll run (most recent draft or calculated)
      const { data: nextPayrollRuns } = await db.select('payrollRuns', {
        select: '*',
        filters: { companyId: company.id },
        order: { column: 'createdAt', ascending: false },
        limit: 1
      })
      const nextPayrollRun = nextPayrollRuns?.[0]

      // Get total payroll cost from most recent approved run
      const { data: recentPayrollRuns } = await db.select('payrollRuns', {
        select: `
          *,
          payrollCalculations (
            finalNetPay
          )
        `,
        filters: { companyId: company.id, status: 'approved' },
        order: { column: 'createdAt', ascending: false },
        limit: 1
      })
      const recentPayrollRun = recentPayrollRuns?.[0]

      const totalPayrollCost = recentPayrollRun?.payrollCalculations?.reduce(
        (sum: number, calc: any) => sum + calc.finalNetPay, 0
      ) || 0

      // Get total active deductions
      const { data: activeDeductions } = await db.select('staffDeductions', {
        select: `
          monthlyDeduction,
          staffMembers!inner (
            companyId
          )
        `,
        filters: { 'staffMembers.companyId': company.id, status: 'active' }
      })

      const totalDeductions = activeDeductions?.reduce(
        (sum: number, deduction: any) => sum + deduction.monthlyDeduction, 0
      ) || 0

      setStats({
        totalActiveEmployees: totalActiveEmployees || 0,
        nextPayrollRun,
        totalPayrollCost,
        totalDeductions
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of {company?.name} payroll and staff metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Employees
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalActiveEmployees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Staff members currently employed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Payroll
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.nextPayrollRun 
                ? `${stats.nextPayrollRun.periodStart} - ${stats.nextPayrollRun.periodEnd}`
                : 'None'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.nextPayrollRun?.status === 'draft' ? 'Draft' : 'Calculated'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payroll Cost
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalPayrollCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last approved payroll run
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Deductions
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5Z" />
              <path d="M12 5L8 21l4-7 4 7-4-16" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalDeductions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly deductions total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest payroll and staff management activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="text-left p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="font-medium">Add Staff</div>
                <div className="text-sm text-muted-foreground">
                  Register new employee
                </div>
              </button>
              <button className="text-left p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="font-medium">Run Payroll</div>
                <div className="text-sm text-muted-foreground">
                  Process monthly payroll
                </div>
              </button>
              <button className="text-left p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-muted-foreground">
                  Generate payslips & reports
                </div>
              </button>
              <button className="text-left p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="font-medium">Manage Payments</div>
                <div className="text-sm text-muted-foreground">
                  Configure staff payments
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
