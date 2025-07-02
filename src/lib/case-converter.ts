/**
 * Case conversion utilities for database interactions
 * Handles conversion between camelCase (TypeScript) and snake_case (PostgreSQL)
 */

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert object keys from camelCase to snake_case
 */
export function objectToSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key)
    
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[snakeKey] = objectToSnakeCase(value)
    } else if (Array.isArray(value)) {
      result[snakeKey] = value.map(item => 
        item && typeof item === 'object' && !(item instanceof Date) 
          ? objectToSnakeCase(item) 
          : item
      )
    } else {
      result[snakeKey] = value
    }
  }
  
  return result
}

/**
 * Convert object keys from snake_case to camelCase
 */
export function objectToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key)
    
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[camelKey] = objectToCamelCase(value)
    } else if (Array.isArray(value)) {
      result[camelKey] = value.map(item => 
        item && typeof item === 'object' && !(item instanceof Date)
          ? objectToCamelCase(item) 
          : item
      )
    } else {
      result[camelKey] = value
    }
  }
  
  return result
}

/**
 * Database insert/update helper that converts camelCase to snake_case
 */
export function prepareForDatabase<T extends Record<string, any>>(data: T): Record<string, any> {
  return objectToSnakeCase(data)
}

/**
 * API response helper that converts snake_case to camelCase
 */
export function prepareFromDatabase<T extends Record<string, any>>(data: T): Record<string, any> {
  return objectToCamelCase(data)
}

/**
 * Type-safe wrapper for Supabase operations with automatic case conversion
 */
export class DatabaseAdapter {
  /**
   * Prepare data for insertion/update by converting to snake_case
   */
  static prepareInsert<T extends Record<string, any>>(data: T): Record<string, any> {
    return prepareForDatabase(data)
  }

  /**
   * Process response data by converting from snake_case to camelCase
   */
  static processResponse<T extends Record<string, any>>(data: T[]): Record<string, any>[]
  static processResponse<T extends Record<string, any>>(data: T): Record<string, any>
  static processResponse<T extends Record<string, any>>(data: T | T[]): Record<string, any> | Record<string, any>[] {
    if (Array.isArray(data)) {
      return data.map(item => prepareFromDatabase(item))
    }
    return prepareFromDatabase(data)
  }

  /**
   * Convert filter object keys to snake_case for database queries
   */
  static prepareFilter<T extends Record<string, any>>(filter: T): Record<string, any> {
    return prepareForDatabase(filter)
  }
}

/**
 * Common field mappings for frequently used conversions
 */
export const FieldMappings = {
  // User fields
  firstName: 'first_name',
  lastName: 'last_name',
  avatarUrl: 'avatar_url',
  
  // Company fields
  companyId: 'company_id',
  tinNumber: 'tin_number',
  registrationNumber: 'registration_number',
  primaryBusiness: 'primary_business',
  
  // Staff fields
  staffNumber: 'staff_number',
  employeeCategory: 'employee_category',
  birthDate: 'birth_date',
  departmentId: 'department_id',
  employmentDate: 'employment_date',
  idPassportNo: 'id_passport_no',
  bankName: 'bank_name',
  bankCode: 'bank_code',
  accountNo: 'account_no',
  emergencyContactName: 'emergency_contact_name',
  emergencyContactRelationship: 'emergency_contact_relationship',
  emergencyContactPhone: 'emergency_contact_phone',
  
  // Payroll fields
  payrollRunId: 'payroll_run_id',
  staffMemberId: 'staff_member_id',
  paymentTypeId: 'payment_type_id',
  deductionTypeId: 'deduction_type_id',
  totalGrossSalary: 'total_gross_salary',
  basicPayGross: 'basic_pay_gross',
  transportAllowanceGross: 'transport_allowance_gross',
  otherPayments: 'other_payments',
  employerPension: 'employer_pension',
  employeePension: 'employee_pension',
  employerMaternity: 'employer_maternity',
  employeeMaternity: 'employee_maternity',
  employerRama: 'employer_rama',
  employeeRama: 'employee_rama',
  cbhiDeduction: 'cbhi_deduction',
  otherDeductions: 'other_deductions',
  totalAppliedDeductions: 'total_applied_deductions',
  finalNetPay: 'final_net_pay',
  grossPay: 'gross_pay',
  totalDeductions: 'total_deductions',
  netPay: 'net_pay',
  taxAmount: 'tax_amount',
  overtimeAmount: 'overtime_amount',
  allowancesAmount: 'allowances_amount',
  benefitsAmount: 'benefits_amount',
  
  // Date fields
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  approvedAt: 'approved_at',
  processedAt: 'processed_at',
  periodStart: 'period_start',
  periodEnd: 'period_end',
  payDate: 'pay_date',
  startDate: 'start_date',
  
  // Boolean fields
  isActive: 'is_active',
  isMandatory: 'is_mandatory',
  affectsTax: 'affects_tax',
  
  // Calculated fields
  calculationMethod: 'calculation_method',
  originalAmount: 'original_amount',
  monthlyDeduction: 'monthly_deduction',
  deductedSoFar: 'deducted_so_far',
  rejectionReason: 'rejection_reason'
} as const

/**
 * Get database field name from camelCase
 */
export function getDbField(camelCaseField: keyof typeof FieldMappings): string {
  return FieldMappings[camelCaseField] || toSnakeCase(camelCaseField)
}

/**
 * Get camelCase field name from database field
 */
export function getCamelField(dbField: string): string {
  const mapping = Object.entries(FieldMappings).find(([_, dbName]) => dbName === dbField)
  return mapping ? mapping[0] : toCamelCase(dbField)
}
