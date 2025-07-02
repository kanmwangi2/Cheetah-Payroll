'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Company, CompanyContextType, UserRole, Permission } from '@/types'
import { useAuth } from './use-auth'
import { db } from '@/lib/supabase-enhanced'

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)

  useEffect(() => {
    if (user?.selectedCompanyId) {
      loadCompany(user.selectedCompanyId)
    }
  }, [user?.selectedCompanyId])

  const loadCompany = async (companyId: string) => {
    try {
      const { data } = await db.select('companies', {
        filters: { id: companyId },
        single: true
      })

      setCompany(data)
    } catch (error) {
      console.error('Error loading company:', error)
      setCompany(null)
    }
  }

  const getUserRole = (): UserRole | null => {
    if (!user || !company) return null

    const roleRecord = user.roles.find(role => 
      role.companyId === company.id || 
      ['primary_admin', 'app_admin'].includes(role.role)
    )

    return roleRecord?.role || null
  }

  const canAccess = (permission: Permission): boolean => {
    const role = getUserRole()
    if (!role) return false

    return hasPermission(role, permission)
  }

  return (
    <CompanyContext.Provider value={{
      company,
      setCompany,
      userRole: getUserRole(),
      canAccess
    }}>
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}

// Permission system
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions: Record<UserRole, Permission[]> = {
    primary_admin: [
      'manage_companies',
      'manage_users', 
      'manage_global_taxes',
      'manage_company_settings',
      'manage_staff',
      'manage_payments',
      'manage_deductions',
      'create_payroll',
      'approve_payroll',
      'view_reports',
      'manage_custom_fields'
    ],
    app_admin: [
      'manage_companies',
      'manage_users',
      'manage_global_taxes',
      'manage_company_settings',
      'manage_staff',
      'manage_payments',
      'manage_deductions',
      'create_payroll',
      'approve_payroll',
      'view_reports',
      'manage_custom_fields'
    ],
    company_admin: [
      'manage_company_settings',
      'manage_staff',
      'manage_payments',
      'manage_deductions',
      'create_payroll',
      'approve_payroll',
      'view_reports',
      'manage_custom_fields'
    ],
    payroll_preparer: [
      'manage_staff',
      'manage_payments',
      'manage_deductions',
      'create_payroll',
      'view_reports'
    ],
    payroll_approver: [
      'approve_payroll',
      'view_reports'
    ]
  }

  return permissions[role]?.includes(permission) || false
}
