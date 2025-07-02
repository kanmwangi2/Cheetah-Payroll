import { Database } from './supabase'

// Frontend types using camelCase conventions
export interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  description: string | null
  phoneNumber: string | null
  email: string | null
  address: string | null
  tinNumber: string | null
  registrationNumber: string | null
  logo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserCompanyRole {
  id: string
  userId: string
  companyId: string
  role: 'primary_admin' | 'app_admin' | 'company_admin' | 'payroll_preparer' | 'payroll_approver'
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  companyId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface StaffMember {
  id: string
  companyId: string
  departmentId: string | null
  staffNumber: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  rssbNumber: string | null
  employeeCategory: string | null
  gender: string | null
  birthDate: string | null
  designation: string | null
  employmentDate: string | null
  nationality: string | null
  idPassportNo: string | null
  province: string | null
  district: string | null
  sector: string | null
  cell: string | null
  village: string | null
  bankName: string | null
  bankCode: string | null
  accountNo: string | null
  branch: string | null
  emergencyContactName: string | null
  emergencyContactRelationship: string | null
  emergencyContactPhone: string | null
  status: 'active' | 'inactive'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomFieldDefinition {
  id: string
  companyId: string
  fieldName: string
  fieldType: 'text' | 'number' | 'date' | 'select'
  fieldOptions: string | null
  isRequired: boolean
  createdAt: string
  updatedAt: string
}

export interface StaffCustomField {
  id: string
  staffMemberId: string
  fieldId: string
  fieldValue: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentType {
  id: string
  companyId: string
  name: string
  description: string | null
  amount: number | null
  taxable: boolean
  calculationMethod: 'fixed' | 'percentage' | 'formula'
  formula: string | null
  isActive: boolean
  order: number
  type: 'gross' | 'net' | 'deduction'
  createdAt: string
  updatedAt: string
}

export interface StaffPayment {
  id: string
  staffMemberId: string
  paymentTypeId: string
  amount: number
  createdAt: string
  updatedAt: string
}

export interface DeductionType {
  id: string
  companyId: string
  name: string
  description: string | null
  amount: number | null
  calculationMethod: 'fixed' | 'percentage' | 'formula'
  formula: string | null
  isMandatory: boolean
  affectsTax: boolean
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface StaffDeduction {
  id: string
  staffMemberId: string
  deductionTypeId: string
  description: string | null
  originalAmount: number
  monthlyDeduction: number
  deductedSoFar: number
  startDate: string
  status: 'active' | 'inactive' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface PayrollRun {
  id: string
  companyId: string
  periodStart: string
  periodEnd: string
  payDate: string | null
  description: string | null
  status: 'draft' | 'calculated' | 'approved' | 'rejected' | 'processed'
  createdBy: string | null
  approvedBy: string | null
  approvedAt: string | null
  processedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export interface PayrollCalculation {
  id: string
  payrollRunId: string
  staffMemberId: string
  basicPayGross: number
  transportAllowanceGross: number
  totalGrossSalary: number
  employerPension: number
  employeePension: number
  employerMaternity: number
  employeeMaternity: number
  employerRama: number
  employeeRama: number
  paye: number
  cbhiDeduction: number
  totalAppliedDeductions: number
  finalNetPay: number
  grossPay: number
  taxAmount: number
  totalDeductions: number
  netPay: number
  status: 'calculated' | 'pending' | 'approved' | 'paid'
  paymentBreakdown: Record<string, number>
  deductionBreakdown: Record<string, number>
  createdAt: string
  updatedAt: string
}

export interface GlobalTaxSettings {
  id: string
  pensionRate: number
  pensionEmployerRate: number
  pensionEmployeeRate: number
  maternityRate: number
  maternityEmployerRate: number
  maternityEmployeeRate: number
  cbhiRate: number
  ramaRate: number
  ramaEmployerRate: number
  ramaEmployeeRate: number
  payeTaxBands: any[]
  updatedAt: string
}

export interface CompanyTaxExemptions {
  id: string
  companyId: string
  pensionExempt: boolean
  maternityExempt: boolean
  cbhiExempt: boolean
  ramaExempt: boolean
  payeExempt: boolean
  updatedAt: string
}

// Insert types (using camelCase)
export type CompanyInsert = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
export type StaffMemberInsert = Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>
export type PaymentTypeInsert = Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>
export type DeductionTypeInsert = Omit<DeductionType, 'id' | 'createdAt' | 'updatedAt'>
export type StaffDeductionInsert = Omit<StaffDeduction, 'id' | 'createdAt' | 'updatedAt'>
export type PayrollRunInsert = Omit<PayrollRun, 'id' | 'createdAt' | 'updatedAt'>

// User roles
export type UserRole = 'primary_admin' | 'app_admin' | 'company_admin' | 'payroll_preparer' | 'payroll_approver'

// Extended types with relations
export interface StaffMemberWithDepartment extends StaffMember {
  department?: Department
}

export interface StaffMemberWithPayments extends StaffMember {
  staffPayments: (StaffPayment & { paymentType: PaymentType })[]
}

export interface StaffMemberWithDeductions extends StaffMember {
  staffDeductions: (StaffDeduction & { deductionType: DeductionType })[]
}

export interface PayrollCalculationWithStaff extends PayrollCalculation {
  staffMember: StaffMember
}

export interface PayrollRunWithDetails extends PayrollRun {
  payrollCalculations: PayrollCalculationWithStaff[]
  createdByProfile: Profile
  approvedByProfile?: Profile
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
