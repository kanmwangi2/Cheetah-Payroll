/**
 * Comprehensive data validation system
 * Ensures all data from Firestore meets strict requirements
 */

import { logger } from './logger';

// Base validation interface
interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: string[];
  sanitizedData?: T;
}

// Required field validation
export function validateRequiredFields<T>(data: Record<string, unknown>, requiredFields: (keyof T)[], entityType: string): ValidationResult<T> {
  const errors: string[] = [];
  const sanitizedData = { ...data };

  for (const field of requiredFields) {
    const value = data[field as string];
    if (value === null || value === undefined || value === '') {
      errors.push(`Missing required field: ${String(field)}`);
    }
  }

  if (errors.length > 0) {
    logger.error(`${entityType} validation failed`, {
      entityId: data.id,
      errors,
      data: sanitizedData
    } as any);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? (sanitizedData as unknown as T) : undefined
  };
}

// Staff validation schema
export interface StaffValidationSchema {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  rssbNumber: string;
  staffNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  department: string;
  position: string;
  startDate: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'active' | 'inactive' | 'terminated';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export function validateStaffRecord(data: Record<string, unknown>): ValidationResult<StaffValidationSchema> {
  const requiredFields: (keyof StaffValidationSchema)[] = [
    'firstName', 'lastName', 'idNumber', 'rssbNumber', 'staffNumber',
    'email', 'phone', 'dateOfBirth', 'gender', 'maritalStatus',
    'address', 'department', 'position', 'startDate', 'employmentType', 'status'
  ];

  const result = validateRequiredFields<StaffValidationSchema>(data, requiredFields, 'Staff');
  
  if (!result.isValid) {
    return result;
  }

  const errors: string[] = [];
  const sanitizedData = { ...data };

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof data.email === 'string' && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate staff number uniqueness requirement
  if (typeof data.staffNumber === 'string' && (!data.staffNumber || data.staffNumber.trim() === '')) {
    errors.push('Staff number cannot be empty');
  }

  // Validate emergency contact
  const emergencyContact = data.emergencyContact as Record<string, unknown> | undefined;
  if (!emergencyContact?.name || !emergencyContact?.phone) {
    errors.push('Emergency contact information incomplete');
  }

  // Validate bank details
  const bankDetails = data.bankDetails as Record<string, unknown> | undefined;
  if (!bankDetails?.bankName || !bankDetails?.accountNumber) {
    errors.push('Bank details incomplete');
  }

  // Validate enum values
  const validGenders = ['male', 'female'];
  if (typeof data.gender === 'string' && !validGenders.includes(data.gender)) {
    errors.push('Invalid gender value');
  }

  const validStatuses = ['active', 'inactive', 'terminated'];
  if (typeof data.status === 'string' && !validStatuses.includes(data.status)) {
    errors.push('Invalid status value');
  }

  if (errors.length > 0) {
    logger.error('Staff record detailed validation failed', {
      staffId: data.id,
      staffNumber: data.staffNumber,
      errors,
      data: sanitizedData
    } as any);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? (sanitizedData as unknown as StaffValidationSchema) : undefined
  };
}

// Payment validation schema
export interface PaymentValidationSchema {
  id: string;
  companyId: string;
  type: string;
  amount: number;
  staffId: string;
  isGross: boolean;
  isRecurring: boolean;
  effectiveDate: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export function validatePaymentRecord(data: Record<string, unknown>): ValidationResult<PaymentValidationSchema> {
  const requiredFields: (keyof PaymentValidationSchema)[] = [
    'type', 'amount', 'staffId', 'status'
  ];

  const result = validateRequiredFields<PaymentValidationSchema>(data, requiredFields, 'Payment');
  
  if (!result.isValid) {
    return result;
  }

  const errors: string[] = [];

  // Validate amount is positive number
  if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  // Validate boolean fields
  if (typeof data.isGross !== 'boolean') {
    errors.push('isGross must be a boolean');
  }

  if (typeof data.isRecurring !== 'boolean') {
    errors.push('isRecurring must be a boolean');
  }

  // Validate status
  const validStatuses = ['active', 'inactive'];
  if (typeof data.status === 'string' && !validStatuses.includes(data.status)) {
    errors.push('Invalid status value');
  }

  if (errors.length > 0) {
    logger.error('Payment record validation failed', {
      paymentId: data.id,
      staffId: data.staffId,
      errors
    } as any);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? (data as unknown as PaymentValidationSchema) : undefined
  };
}

// Deduction validation schema
export interface DeductionValidationSchema {
  id: string;
  companyId: string;
  type: string;
  originalAmount: number;
  remainingBalance: number;
  monthlyInstallment?: number;
  staffId: string;
  status: 'active' | 'completed' | 'cancelled';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export function validateDeductionRecord(data: Record<string, unknown>): ValidationResult<DeductionValidationSchema> {
  const requiredFields: (keyof DeductionValidationSchema)[] = [
    'type', 'originalAmount', 'remainingBalance', 'staffId', 'status'
  ];

  const result = validateRequiredFields<DeductionValidationSchema>(data, requiredFields, 'Deduction');
  
  if (!result.isValid) {
    return result;
  }

  const errors: string[] = [];

  // Validate amounts are positive numbers
  if (typeof data.originalAmount !== 'number' || data.originalAmount <= 0) {
    errors.push('Original amount must be a positive number');
  }

  if (typeof data.remainingBalance !== 'number' || data.remainingBalance < 0) {
    errors.push('Remaining balance must be a non-negative number');
  }

  // Validate remaining balance doesn't exceed original amount
  if (typeof data.remainingBalance === 'number' && typeof data.originalAmount === 'number' && data.remainingBalance > data.originalAmount) {
    errors.push('Remaining balance cannot exceed original amount');
  }

  // Validate status
  const validStatuses = ['active', 'completed', 'cancelled'];
  if (typeof data.status === 'string' && !validStatuses.includes(data.status)) {
    errors.push('Invalid status value');
  }

  if (errors.length > 0) {
    logger.error('Deduction record validation failed', {
      deductionId: data.id,
      staffId: data.staffId,
      errors
    } as any);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? (data as unknown as DeductionValidationSchema) : undefined
  };
}

// Payroll validation schema
export interface PayrollValidationSchema {
  id: string;
  companyId: string;
  period: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'processed';
  staffCount: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalEmployeeTax: number;
  totalEmployerContributions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function validatePayrollRecord(data: Record<string, unknown>): ValidationResult<PayrollValidationSchema> {
  const requiredFields: (keyof PayrollValidationSchema)[] = [
    'period', 'status', 'staffCount', 'totalGrossPay', 'totalNetPay'
  ];

  const result = validateRequiredFields<PayrollValidationSchema>(data, requiredFields, 'Payroll');
  
  if (!result.isValid) {
    return result;
  }

  const errors: string[] = [];

  // Validate numeric fields
  if (typeof data.staffCount !== 'number' || data.staffCount < 0) {
    errors.push('Staff count must be a non-negative number');
  }

  if (typeof data.totalGrossPay !== 'number' || data.totalGrossPay < 0) {
    errors.push('Total gross pay must be a non-negative number');
  }

  if (typeof data.totalNetPay !== 'number' || data.totalNetPay < 0) {
    errors.push('Total net pay must be a non-negative number');
  }

  // Validate status
  const validStatuses = ['draft', 'pending', 'completed'];
  if (!validStatuses.includes(data.status as string)) {
    errors.push('Invalid status value');
  }

  if (errors.length > 0) {
    logger.error('Payroll record validation failed', {
      payrollId: data.id,
      period: data.period,
      errors
    } as any);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? (data as unknown as PayrollValidationSchema) : undefined
  };
}

// Generic data validator with error reporting
export function validateAndFilterRecords<T>(
  records: Record<string, unknown>[],
  validator: (data: Record<string, unknown>) => ValidationResult<T>,
  entityType: string
): T[] {
  const validRecords: T[] = [];
  const invalidRecords: Array<{record: Record<string, unknown>; errors: string[]}> = [];

  for (const record of records) {
    const validation = validator(record);
    
    if (validation.isValid && validation.sanitizedData) {
      validRecords.push(validation.sanitizedData as T);
    } else {
      invalidRecords.push({
        record,
        errors: validation.errors
      });
    }
  }

  if (invalidRecords.length > 0) {
    logger.error(`Found ${invalidRecords.length} invalid ${entityType} records`, {
      invalidRecords,
      validCount: validRecords.length,
      totalCount: records.length
    } as any);

    // In development, also console.error for immediate visibility
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Invalid ${entityType} records found:`, invalidRecords);
    }
  }

  logger.info(`${entityType} validation complete`, {
    validCount: validRecords.length,
    invalidCount: invalidRecords.length,
    totalCount: records.length
  });

  return validRecords;
}

// Data sanitization utilities
export function sanitizeFirestoreData(data: Record<string, unknown>): Record<string, unknown> {
  if (!data) {return data;}
  
  // Remove undefined values and convert them to null for consistency
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      sanitized[key] = null;
    }
  });
  
  return sanitized;
}

// Import the actual types for wrapper functions
import { Payment, Deduction, Payroll, Staff } from '../types';

// Wrapper functions to bridge validation schemas to actual types
export function validatePaymentRecordAsPayment(data: Record<string, unknown>): ValidationResult<Payment> {
  const result = validatePaymentRecord(data);
  return {
    isValid: result.isValid,
    errors: result.errors,
    sanitizedData: result.sanitizedData ? (result.sanitizedData as unknown as Payment) : undefined
  };
}

export function validateDeductionRecordAsDeduction(data: Record<string, unknown>): ValidationResult<Deduction> {
  const result = validateDeductionRecord(data);
  return {
    isValid: result.isValid,
    errors: result.errors,
    sanitizedData: result.sanitizedData ? (result.sanitizedData as unknown as Deduction) : undefined
  };
}

export function validatePayrollRecordAsPayroll(data: Record<string, unknown>): ValidationResult<Payroll> {
  const result = validatePayrollRecord(data);
  return {
    isValid: result.isValid,
    errors: result.errors,
    sanitizedData: result.sanitizedData ? (result.sanitizedData as unknown as Payroll) : undefined
  };
}

export function validateStaffRecordAsStaff(data: Record<string, unknown>): ValidationResult<Staff> {
  const result = validateStaffRecord(data);
  return {
    isValid: result.isValid,
    errors: result.errors,
    sanitizedData: result.sanitizedData ? (result.sanitizedData as unknown as Staff) : undefined
  };
}