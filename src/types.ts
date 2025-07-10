// Shared types for Cheetah Payroll

export type UserRole = 'primary_admin' | 'app_admin' | 'company_admin' | 'payroll_approver' | 'payroll_preparer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyIds: string[];
  profileData: any;
}

export interface Company {
  id: string;
  name: string;
  settings: any;
  taxConfig: any;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  companyId: string;
  personalDetails: any;
  employmentDetails: any;
  bankDetails: any;
  createdAt: string;
  updatedAt: string;
}

// ...add more types as needed for payments, deductions, payroll, etc.
