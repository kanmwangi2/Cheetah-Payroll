// Shared types for Cheetah Payroll

export type UserRole =
  | 'primary_admin'
  | 'app_admin'
  | 'company_admin'
  | 'payroll_approver'
  | 'payroll_preparer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyIds: string[];
  profileData?: Record<string, unknown>;
  phone?: string;
  department?: string;
  uid?: string;
  status?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollTaxSettings {
  paye: boolean;
  pension: boolean;
  maternity: boolean;
  cbhi: boolean;
  rama: boolean;
}

export interface Company {
  id: string;
  name: string;
  settings?: Record<string, unknown>;
  taxConfig?: Record<string, unknown>;
  payrollTaxSettings?: PayrollTaxSettings;
  structure?: {
    departments: string[];
    paymentTypes: string[];
    deductionTypes: string[];
  };
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  sector?: string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  idNumber: string;
  rssbNumber?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
  nationality: string;
  phone: string;
  email: string;
  address: string;
  employeeId?: string; // For backward compatibility
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface EmploymentDetails {
  staffNumber: string;
  position: string;
  department?: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName?: string;
  bankCode?: string; // For backward compatibility
}

export interface Staff {
  id?: string;
  companyId: string;
  personalDetails: PersonalDetails;
  employmentDetails: EmploymentDetails;
  bankDetails: BankDetails;
  emergencyContact?: EmergencyContact;
  createdAt: string;
  updatedAt: string;
}

// Legacy interface for backward compatibility
export interface StaffInput {
  staffNumber: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  startDate: string;
  endDate?: string;
  status?: 'active' | 'inactive';
  [key: string]: unknown;
}

// Payment Types
export type PaymentType = 
  | 'basic_salary'
  | 'transport_allowance'
  | 'overtime_allowance'
  | 'bonus'
  | 'commission'
  | 'other_allowance';

export interface Payment {
  id: string;
  companyId: string;
  staffId: string;
  type: PaymentType;
  amount: number;
  isGross: boolean;
  isRecurring: boolean;
  effectiveDate: string;
  endDate?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Deduction Types
export type DeductionType = 
  | 'advance'
  | 'loan'
  | 'other_charge'
  | 'disciplinary_deduction';

export interface Deduction {
  id: string;
  companyId: string;
  staffId: string;
  type: DeductionType;
  originalAmount: number;
  remainingBalance: number;
  monthlyInstallment?: number;
  numberOfInstallments?: number;
  remainingInstallments?: number;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  amount?: number; // For backward compatibility
}

// Tax Configuration Types
export interface PayeTaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxRates {
  employee: number;
  employer: number;
}

export interface TaxConfiguration {
  payeBrackets: PayeTaxBracket[];
  pensionRates: TaxRates;
  maternityRates: TaxRates;
  cbhiRates: TaxRates;
  ramaRates: TaxRates;
  effectiveDate: string;
}

// Payroll Types
export interface PayrollCalculation {
  grossPay: number;
  basicPay: number;
  transportAllowance: number;
  otherAllowances: number; // Backward compatibility - sum of all individual allowances
  
  // Individual allowance fields (dynamic)
  individualAllowances: Record<string, number>; // e.g., { "housing_allowance": 100000, "medical_allowance": 50000 }
  
  // Tax calculations
  payeBeforeReliefs: number;
  pensionEmployee: number;
  pensionEmployer: number;
  totalPension: number; // pensionEmployee + pensionEmployer
  maternityEmployee: number;
  maternityEmployer: number;
  totalMaternity: number; // maternityEmployee + maternityEmployer
  ramaEmployee: number;
  ramaEmployer: number;
  totalRAMA: number; // ramaEmployee + ramaEmployer
  
  // Net calculations
  netBeforeCBHI: number;
  cbhiEmployee: number;
  otherDeductions: number;
  finalNetPay: number;
}

export interface StaffPayroll {
  id: string;
  payrollId: string;
  staffId: string;
  staffName: string;
  calculations: PayrollCalculation;
  status: 'draft' | 'calculated' | 'approved' | 'processed';
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id: string;
  companyId: string;
  period: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'processed';
  totalGrossPay: number;
  totalNetPay: number;
  totalEmployeeTax: number;
  totalEmployerContributions: number;
  staffCount: number;
  createdBy: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  processedAt?: string;
}

// Report Types
export interface StatutoryReport {
  id: string;
  companyId: string;
  type: 'paye' | 'pension' | 'maternity' | 'cbhi' | 'rama';
  period: string;
  data: Record<string, unknown>;
  totalAmount: number;
  status: 'draft' | 'generated' | 'submitted';
  generatedAt: string;
  submittedAt?: string;
}

// Audit Trail Types
export interface AuditLog {
  id: string;
  companyId: string;
  entityType: 'staff' | 'payment' | 'deduction' | 'payroll' | 'company';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'process';
  changes: Record<string, unknown>;
  userId: string;
  userName: string;
  timestamp: string;
  ip?: string;
}

// Import/Export Types
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  data?: unknown[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: unknown;
}
