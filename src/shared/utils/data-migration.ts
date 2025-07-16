/**
 * Data Migration Utility
 * Tools for identifying and fixing invalid records in the database
 */

import { 
  collection, 
  getDocs, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../../core/config/firebase.config';
import { logger } from './logger';
import {
  validateStaffRecord,
  validatePaymentRecord,
  validateDeductionRecord,
  validatePayrollRecord,
  sanitizeFirestoreData
} from './data-validation';

type ValidationResult<T = unknown> = {
  isValid: boolean;
  errors: string[];
  sanitizedData?: T;
};

export interface MigrationReport {
  collectionName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  fixedRecords: number;
  deletedRecords: number;
  errors: Array<{
    id: string;
    errors: string[];
    action: 'fixed' | 'deleted' | 'failed';
  }>;
}

export interface MigrationOptions {
  dryRun?: boolean;
  deleteInvalidRecords?: boolean;
  fixMissingFields?: boolean;
  companyId: string;
}

// Staff record fixes
function generateStaffNumber(staffData: Record<string, unknown>, index: number): string {
  if (staffData.staffNumber) {return staffData.staffNumber as string;}
  
  // Generate from name + index if available
  const firstName = (staffData.firstName as string) || '';
  const lastName = (staffData.lastName as string) || '';
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  
  return `EMP${initials}${String(index + 1).padStart(3, '0')}`;
}

function fixStaffRecord(staffData: Record<string, unknown>, index: number): Record<string, unknown> {
  const fixed = { ...staffData };
  
  // Fix missing required fields with reasonable defaults
  if (!fixed.staffNumber) {
    fixed.staffNumber = generateStaffNumber(staffData, index);
  }
  
  if (!fixed.status) {
    fixed.status = 'active';
  }
  
  if (!fixed.gender) {
    fixed.gender = 'male'; // Default, should be updated manually
  }
  
  if (!fixed.maritalStatus) {
    fixed.maritalStatus = 'single';
  }
  
  if (!fixed.employmentType) {
    fixed.employmentType = 'full-time';
  }
  
  // Fix nested objects
  if (!fixed.emergencyContact) {
    fixed.emergencyContact = {
      name: 'To be updated',
      phone: 'To be updated',
      relationship: 'To be updated'
    };
  }
  
  if (!fixed.bankDetails) {
    fixed.bankDetails = {
      bankName: 'To be updated',
      accountNumber: 'To be updated',
      accountName: `${fixed.firstName as string || ''} ${fixed.lastName as string || ''}`.trim() || 'To be updated'
    };
  }
  
  return fixed;
}

// Payment record fixes
function fixPaymentRecord(paymentData: Record<string, unknown>): Record<string, unknown> {
  const fixed = { ...paymentData };
  
  if (typeof fixed.amount !== 'number') {
    fixed.amount = parseFloat(fixed.amount as string) || 0;
  }
  
  if (typeof fixed.isGross !== 'boolean') {
    fixed.isGross = false;
  }
  
  if (typeof fixed.isRecurring !== 'boolean') {
    fixed.isRecurring = false;
  }
  
  if (!fixed.status) {
    fixed.status = 'active';
  }
  
  return fixed;
}

// Deduction record fixes
function fixDeductionRecord(deductionData: Record<string, unknown>): Record<string, unknown> {
  const fixed = { ...deductionData };
  
  if (typeof fixed.originalAmount !== 'number') {
    fixed.originalAmount = parseFloat(fixed.originalAmount as string) || 0;
  }
  
  if (typeof fixed.remainingBalance !== 'number') {
    fixed.remainingBalance = parseFloat(fixed.remainingBalance as string) || (fixed.originalAmount as number) || 0;
  }
  
  if (!fixed.status) {
    fixed.status = 'active';
  }
  
  return fixed;
}

// Payroll record fixes
function fixPayrollRecord(payrollData: Record<string, unknown>): Record<string, unknown> {
  const fixed = { ...payrollData };
  
  if (typeof fixed.staffCount !== 'number') {
    fixed.staffCount = parseInt(fixed.staffCount as string, 10) || 0;
  }
  
  if (typeof fixed.totalGrossPay !== 'number') {
    fixed.totalGrossPay = parseFloat(fixed.totalGrossPay as string) || 0;
  }
  
  if (typeof fixed.totalNetPay !== 'number') {
    fixed.totalNetPay = parseFloat(fixed.totalNetPay as string) || 0;
  }
  
  if (!fixed.status) {
    fixed.status = 'draft';
  }
  
  return fixed;
}

// Generic migration function
async function migrateCollection(
  collectionName: string,
  validator: (data: Record<string, unknown>) => ValidationResult<unknown>,
  fixer: (data: Record<string, unknown>, index: number) => Record<string, unknown>,
  options: MigrationOptions
): Promise<MigrationReport> {
  
  const report: MigrationReport = {
    collectionName,
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    fixedRecords: 0,
    deletedRecords: 0,
    errors: []
  };
  
  try {
    logger.info(`Starting migration for ${collectionName}`, { 
      companyId: options.companyId,
      dryRun: options.dryRun 
    });
    
    const snapshot = await getDocs(
      collection(db, 'companies', options.companyId, collectionName)
    );
    
    report.totalRecords = snapshot.docs.length;
    
    const batch = writeBatch(db);
    let batchCount = 0;
    
    for (let i = 0; i < snapshot.docs.length; i++) {
      const docRef = snapshot.docs[i];
      const rawData = { id: docRef.id, ...sanitizeFirestoreData(docRef.data()) };
      
      const validation = validator(rawData);
      
      if (validation.isValid) {
        report.validRecords++;
        continue;
      }
      
      report.invalidRecords++;
      
      // Try to fix the record
      if (options.fixMissingFields) {
        try {
          const fixedData = fixer(rawData, i);
          const fixedValidation = validator(fixedData);
          
          if (fixedValidation.isValid) {
            if (!options.dryRun) {
              // Remove id from data before updating
              const { id: _unused, ...updateData } = fixedData;
              void _unused;
              batch.update(doc(db, 'companies', options.companyId, collectionName, docRef.id), updateData as any);
              batchCount++;
              
              // Commit batch every 400 operations (Firestore limit is 500)
              if (batchCount >= 400) {
                await batch.commit();
                batchCount = 0;
              }
            }
            
            report.fixedRecords++;
            report.errors.push({
              id: docRef.id,
              errors: validation.errors,
              action: 'fixed'
            });
          } else {
            // Could not fix, decide whether to delete
            if (options.deleteInvalidRecords) {
              if (!options.dryRun) {
                batch.delete(doc(db, 'companies', options.companyId, collectionName, docRef.id));
                batchCount++;
              }
              
              report.deletedRecords++;
              report.errors.push({
                id: docRef.id,
                errors: validation.errors,
                action: 'deleted'
              });
            } else {
              report.errors.push({
                id: docRef.id,
                errors: validation.errors,
                action: 'failed'
              });
            }
          }
        } catch (error) {
          report.errors.push({
            id: docRef.id,
            errors: [...validation.errors, `Fix attempt failed: ${error}`],
            action: 'failed'
          });
        }
      } else {
        report.errors.push({
          id: docRef.id,
          errors: validation.errors,
          action: 'failed'
        });
      }
    }
    
    // Commit remaining batch operations
    if (batchCount > 0 && !options.dryRun) {
      await batch.commit();
    }
    
    logger.info(`Migration completed for ${collectionName}`, report as any);
    
  } catch (error) {
    logger.error(`Migration failed for ${collectionName}`, error as Error);
    throw error;
  }
  
  return report;
}

// Main migration functions
export async function migrateStaffData(options: MigrationOptions): Promise<MigrationReport> {
  return migrateCollection('staff', validateStaffRecord, fixStaffRecord, options);
}

export async function migratePaymentData(options: MigrationOptions): Promise<MigrationReport> {
  return migrateCollection('payments', validatePaymentRecord, fixPaymentRecord, options);
}

export async function migrateDeductionData(options: MigrationOptions): Promise<MigrationReport> {
  return migrateCollection('deductions', validateDeductionRecord, fixDeductionRecord, options);
}

export async function migratePayrollData(options: MigrationOptions): Promise<MigrationReport> {
  return migrateCollection('payrolls', validatePayrollRecord, fixPayrollRecord, options);
}

// Comprehensive migration for all collections
export async function migrateAllData(options: MigrationOptions): Promise<MigrationReport[]> {
  const reports: MigrationReport[] = [];
  
  logger.info('Starting comprehensive data migration', { 
    companyId: options.companyId,
    dryRun: options.dryRun 
  });
  
  try {
    reports.push(await migrateStaffData(options));
    reports.push(await migratePaymentData(options));
    reports.push(await migrateDeductionData(options));
    reports.push(await migratePayrollData(options));
    
    // Summary report
    const totalRecords = reports.reduce((sum, r) => sum + r.totalRecords, 0);
    const totalFixed = reports.reduce((sum, r) => sum + r.fixedRecords, 0);
    const totalDeleted = reports.reduce((sum, r) => sum + r.deletedRecords, 0);
    const totalInvalid = reports.reduce((sum, r) => sum + r.invalidRecords, 0);
    
    logger.info('Data migration summary', {
      companyId: options.companyId,
      totalRecords,
      totalFixed,
      totalDeleted,
      totalInvalid,
      dryRun: options.dryRun
    });
    
  } catch (error) {
    logger.error('Comprehensive migration failed', error as Error);
    throw error;
  }
  
  return reports;
}

// Utility to check data integrity without fixing
export async function checkDataIntegrity(companyId: string): Promise<MigrationReport[]> {
  return migrateAllData({
    companyId,
    dryRun: true,
    deleteInvalidRecords: false,
    fixMissingFields: false
  });
}

// Quick fix utility for development
export async function quickFixInvalidData(companyId: string): Promise<MigrationReport[]> {
  return migrateAllData({
    companyId,
    dryRun: false,
    deleteInvalidRecords: false,
    fixMissingFields: true
  });
}