import { Database } from './supabase'

// Database row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type UserCompanyRole = Database['public']['Tables']['user_company_roles']['Row']
export type Department = Database['public']['Tables']['departments']['Row']
export type StaffMember = Database['public']['Tables']['staff_members']['Row']
export type CustomFieldDefinition = Database['public']['Tables']['custom_field_definitions']['Row']
export type StaffCustomField = Database['public']['Tables']['staff_custom_fields']['Row']
export type PaymentType = Database['public']['Tables']['payment_types']['Row']
export type StaffPayment = Database['public']['Tables']['staff_payments']['Row']
export type DeductionType = Database['public']['Tables']['deduction_types']['Row']
export type StaffDeduction = Database['public']['Tables']['staff_deductions']['Row']
export type PayrollRun = Database['public']['Tables']['payroll_runs']['Row']
export type PayrollCalculation = Database['public']['Tables']['payroll_calculations']['Row']
export type GlobalTaxSettings = Database['public']['Tables']['global_tax_settings']['Row']
export type CompanyTaxExemptions = Database['public']['Tables']['company_tax_exemptions']['Row']

// Insert types
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type StaffMemberInsert = Database['public']['Tables']['staff_members']['Insert']
export type PaymentTypeInsert = Database['public']['Tables']['payment_types']['Insert']
export type DeductionTypeInsert = Database['public']['Tables']['deduction_types']['Insert']
export type StaffDeductionInsert = Database['public']['Tables']['staff_deductions']['Insert']
export type PayrollRunInsert = Database['public']['Tables']['payroll_runs']['Insert']

// User roles
export type UserRole = 'primary_admin' | 'app_admin' | 'company_admin' | 'payroll_preparer' | 'payroll_approver'

// Extended types with relations
export interface StaffMemberWithDepartment extends StaffMember {
  department?: Department
}

export interface StaffMemberWithPayments extends StaffMember {
  staff_payments: (StaffPayment & { payment_type: PaymentType })[]
}

export interface StaffMemberWithDeductions extends StaffMember {
  staff_deductions: (StaffDeduction & { deduction_type: DeductionType })[]
}

export interface PayrollCalculationWithStaff extends PayrollCalculation {
  staff_member: StaffMember
}

export interface PayrollRunWithDetails extends PayrollRun {
  payroll_calculations: PayrollCalculationWithStaff[]
  created_by_profile: Profile
  approved_by_profile?: Profile
}

// Payroll calculation types
export interface PayrollCalculationInput {
  staffMemberId: string
  paymentTypes: PaymentType[]
  staffPayments: StaffPayment[]
  staffDeductions: StaffDeduction[]
  taxSettings: GlobalTaxSettings
  taxExemptions?: CompanyTaxExemptions
}

export interface PayrollCalculationResult {
  staffMemberId: string
  totalGrossSalary: number
  basicPayGross: number
  transportAllowanceGross: number
  otherPayments: Record<string, number>
  employerPension: number
  employeePension: number
  employerMaternity: number
  employeeMaternity: number
  employerRAMA: number
  employeeRAMA: number
  paye: number
  cbhiDeduction: number
  otherDeductions: Record<string, number>
  totalAppliedDeductions: number
  finalNetPay: number
}

// PAYE tax band structure
export interface PayeTaxBand {
  min: number
  max: number | null
  rate: number
}

// Form types
export interface StaffFormData {
  staffNumber: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  rssbNumber?: string
  employeeCategory?: string
  gender?: string
  birthDate?: string
  departmentId?: string
  designation?: string
  employmentDate?: string
  nationality?: string
  idPassportNo?: string
  province?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
  bankName?: string
  bankCode?: string
  accountNo?: string
  branch?: string
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactPhone?: string
  status: 'active' | 'inactive'
  customFields?: Record<string, string>
}

export interface PaymentFormData {
  staffMemberId: string
  payments: Record<string, number>
}

export interface DeductionFormData {
  staffMemberId: string
  deductionTypeId: string
  description?: string
  originalAmount: number
  monthlyDeduction: number
  deductedSoFar: number
  startDate: string
}

// Report types
export interface StatutoryReportData {
  payrollRunId: string
  month: number
  year: number
  calculations: PayrollCalculationWithStaff[]
}

export interface PayslipData {
  employee: StaffMember
  company: Company
  payrollRun: PayrollRun
  calculation: PayrollCalculation
  paymentBreakdown: Record<string, number>
  deductionBreakdown: Record<string, number>
}

// Navigation and UI types
export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: string
  children?: NavItem[]
}

export interface DashboardStats {
  totalActiveEmployees: number
  nextPayrollRun?: PayrollRun
  totalPayrollCost: number
  totalDeductions: number
}

// Auth context types
export interface AuthUser {
  id: string
  email: string
  profile?: Profile
  roles: UserCompanyRole[]
  selectedCompanyId?: string
}

// Company context types
export interface CompanyContextType {
  company: Company | null
  setCompany: (company: Company | null) => void
  userRole: UserRole | null
  canAccess: (permission: Permission) => boolean
}

// Permission types
export type Permission = 
  | 'manage_companies'
  | 'manage_users'
  | 'manage_global_taxes'
  | 'manage_company_settings'
  | 'manage_staff'
  | 'manage_payments'
  | 'manage_deductions'
  | 'create_payroll'
  | 'approve_payroll'
  | 'view_reports'
  | 'manage_custom_fields'

// Export/Import types
export interface CsvImportResult<T> {
  success: boolean
  data: T[]
  errors: string[]
  rowsProcessed: number
}

export interface CsvExportOptions {
  filename: string
  headers: string[]
  data: Record<string, any>[]
}
