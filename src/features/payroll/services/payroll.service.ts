// Payroll processing with tax calculations and approval workflow
import {
  serverTimestamp,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import { logAuditAction } from '../../../shared/services/audit.service';
import { getTaxConfiguration } from '../../../shared/services/tax-config.service';
import { getActivePayments, calculateStaffPayments } from '../../payments/services/payments.service';
import { calculateStaffDeductions, processLoanPayment, reverseLoanPayment, getDeductions, canProcessDeduction, validateDeductionPayment } from '../../deductions/services/deductions.service';
import { getStaff } from '../../staff/services/staff.service';
import { 
  Payroll, 
  StaffPayroll, 
  PayrollCalculation, 
  TaxConfiguration,
  PayeTaxBracket,
  Staff,
  PayrollTaxSettings 
} from '../../../shared/types';
import { validatePayrollRecordAsPayroll, validateAndFilterRecords, sanitizeFirestoreData } from '../../../shared/utils/data-validation';

// Note: Tax configuration is now loaded dynamically from database
// See tax-config.service.ts for configuration management

/**
 * Calculate payroll with dynamic tax configuration
 * This is the preferred method for all new payroll calculations
 */
export async function calculatePayrollWithCurrentConfig(
  grossPay: number,
  basicPay: number,
  transportAllowance: number,
  otherDeductions: number,
  companyId?: string
): Promise<PayrollCalculation> {
  const taxConfig = await getTaxConfiguration();
  
  // Load company tax settings if companyId is provided
  let companyTaxSettings: PayrollTaxSettings | undefined;
  if (companyId) {
    try {
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        companyTaxSettings = companyData.payrollTaxSettings;
      }
    } catch (error) {
      console.warn('Could not load company tax settings, using defaults:', error);
    }
  }
  
  return calculatePayrollForAmount(grossPay, basicPay, transportAllowance, otherDeductions, taxConfig, companyTaxSettings);
}

/**
 * Calculate PAYE with dynamic tax configuration
 */
export async function calculatePAYEWithCurrentConfig(grossPay: number): Promise<number> {
  const taxConfig = await getTaxConfiguration();
  return calculatePAYE(grossPay, taxConfig.payeBrackets);
}

/**
 * Gross-up calculation with dynamic tax configuration
 */
export async function grossUpAmountWithCurrentConfig(
  targetNetAmount: number,
  basicPayPortion: number,
  transportAllowance: number,
  otherDeductions: number,
  companyId?: string
): Promise<{ grossAmount: number; calculations: PayrollCalculation }> {
  const taxConfig = await getTaxConfiguration();
  
  // Load company tax settings if companyId is provided
  let companyTaxSettings: PayrollTaxSettings | undefined;
  if (companyId) {
    try {
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        companyTaxSettings = companyData.payrollTaxSettings;
      }
    } catch (error) {
      console.warn('Could not load company tax settings, using defaults:', error);
    }
  }
  
  return grossUpAmount(targetNetAmount, basicPayPortion, transportAllowance, otherDeductions, taxConfig, companyTaxSettings);
}


export async function approvePayroll(
  companyId: string,
  payrollId: string,
  userId: string
): Promise<void> {
  const payroll = await getPayroll(companyId, payrollId);
  if (!payroll) {throw new Error('Payroll not found');}
  if (payroll.status !== 'pending_approval') {throw new Error('Only pending payrolls can be approved');}
  
  await updatePayroll(companyId, payrollId, {
    status: 'approved',
    approvedBy: userId,
    approvedAt: new Date().toISOString(),
  });
  
  await logAuditAction({
    companyId,
    userId,
    entityType: 'payroll',
    entityId: payrollId,
    action: 'update',
    details: { action: 'approved', period: payroll.period },
  });
}

export async function rejectPayroll(
  companyId: string,
  payrollId: string,
  userId: string,
  reason: string
): Promise<void> {
  const payroll = await getPayroll(companyId, payrollId);
  if (!payroll) {throw new Error('Payroll not found');}
  if (payroll.status !== 'pending_approval') {throw new Error('Only pending payrolls can be rejected');}
  
  // Reset to draft status for re-submission
  await updatePayroll(companyId, payrollId, {
    status: 'draft',
    updatedAt: new Date().toISOString(),
  });
  
  await logAuditAction({
    companyId,
    userId,
    entityType: 'payroll',
    entityId: payrollId,
    action: 'update',
    details: { action: 'rejected', reason, period: payroll.period },
  });
}

export async function processPayroll(
  companyId: string,
  payrollId: string,
  userId: string
): Promise<void> {
  const payroll = await getPayroll(companyId, payrollId);
  if (!payroll) {throw new Error('Payroll not found');}
  if (payroll.status !== 'approved') {throw new Error('Only approved payrolls can be processed');}
  
  // Update deduction balances for all staff in this payroll
  await updateDeductionBalancesForPayroll(companyId, payrollId, 'process');
  
  await updatePayroll(companyId, payrollId, {
    status: 'processed',
    processedBy: userId,
    processedAt: new Date().toISOString(),
  });
  
  await logAuditAction({
    companyId,
    userId,
    entityType: 'payroll',
    entityId: payrollId,
    action: 'update',
    details: { action: 'processed', period: payroll.period },
  });
}

// Update deduction balances when payroll is processed or deleted
async function updateDeductionBalancesForPayroll(
  companyId: string,
  payrollId: string,
  action: 'process' | 'reverse'
): Promise<void> {
  try {
    // Get all staff payroll records for this payroll
    const staffPayrolls = await getStaffPayrollData(companyId, payrollId);
    
    // Get all active deductions for the company
    const deductions = await getDeductions(companyId);
    
    for (const staffPayroll of staffPayrolls) {
      // Find active deductions for this staff member
      const staffDeductions = deductions.filter(d => 
        d.staffId === staffPayroll.staffId && 
        d.status === 'active' && 
        d.remainingBalance > 0
      );
      
      for (const deduction of staffDeductions) {
        try {
          // Calculate the deduction amount for this payroll cycle
          let deductionAmount = 0;
          
          if (deduction.type === 'loan' && deduction.monthlyInstallment) {
            // For loans, use the monthly installment amount
            deductionAmount = Math.min(deduction.monthlyInstallment, deduction.remainingBalance);
          } else {
            // For one-time deductions, deduct the full remaining balance
            deductionAmount = deduction.remainingBalance;
          }
          
          if (deductionAmount > 0) {
            if (action === 'process') {
              // Validate before processing the deduction
              if (canProcessDeduction(deduction, deductionAmount)) {
                await processLoanPayment(companyId, deduction.id, deductionAmount);
              } else {
                console.warn(`Cannot process deduction ${deduction.id}: insufficient balance or inactive status`);
              }
            } else if (action === 'reverse') {
              // Reverse the deduction (increase balance back)
              await reverseLoanPayment(companyId, deduction.id, deductionAmount);
            }
          }
        } catch (deductionError) {
          console.error(`Error updating deduction ${deduction.id} for staff ${staffPayroll.staffId}:`, deductionError);
          // Continue with other deductions even if one fails
        }
      }
    }
  } catch (error) {
    console.error(`Error updating deduction balances for payroll ${payrollId}:`, error);
    throw new Error(`Failed to update deduction balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validation functions
export function validatePayrollData(payrollData: Partial<Payroll>): string[] {
  const errors: string[] = [];
  
  if (!payrollData.period) {errors.push('Payroll period is required');}
  if (!payrollData.createdBy) {errors.push('Creator information is required');}
  
  return errors;
}

// Utility functions
export function getPayrollSummary(payroll: Payroll, staffPayrolls: StaffPayroll[]) {
  return {
    period: payroll.period,
    status: payroll.status,
    staffCount: staffPayrolls.length,
    totalGross: staffPayrolls.reduce((sum, sp) => sum + sp.calculations.grossPay, 0),
    totalNet: staffPayrolls.reduce((sum, sp) => sum + sp.calculations.finalNetPay, 0),
    totalPAYE: staffPayrolls.reduce((sum, sp) => sum + sp.calculations.payeBeforeReliefs, 0),
    totalPension: staffPayrolls.reduce((sum, sp) => sum + sp.calculations.pensionEmployee + sp.calculations.pensionEmployer, 0),
    totalMaternity: staffPayrolls.reduce((sum, sp) => sum + sp.calculations.maternityEmployee + sp.calculations.maternityEmployer, 0),
    totalRAMA: staffPayrolls.reduce((sum, sp) => sum + sp.calculations.ramaEmployee + sp.calculations.ramaEmployer, 0),
    totalCBHI: staffPayrolls.reduce((sum, sp) => sum + sp.calculations.cbhiEmployee, 0),
  };
}
// Payroll engine logic (Rwanda tax, payroll creation, review, approval)

// Rwanda tax calculation functions
export function calculatePAYE(grossPay: number, brackets: PayeTaxBracket[]): number {
  let tax = 0;
  let remainingIncome = grossPay;
  
  for (const bracket of brackets) {
    if (remainingIncome <= 0) {break;}
    
    const bracketMin = bracket.min;
    const bracketMax = bracket.max || Infinity;
    const rate = bracket.rate / 100;
    
    if (grossPay > bracketMin) {
      const taxableInThisBracket = Math.min(
        remainingIncome,
        Math.min(bracketMax, grossPay) - bracketMin
      );
      
      if (taxableInThisBracket > 0) {
        tax += taxableInThisBracket * rate;
        remainingIncome -= taxableInThisBracket;
      }
    }
  }
  
  return Math.round(tax);
}

// Gross-up calculation using binary search method
export function grossUpAmount(
  targetNetAmount: number,
  basicPayPortion: number,
  transportAllowance: number,
  otherDeductions: number,
  taxConfig: TaxConfiguration,
  companyTaxSettings?: PayrollTaxSettings
): { grossAmount: number; calculations: PayrollCalculation } {
  let lowerBound = targetNetAmount;
  let upperBound = targetNetAmount * 2.5; // Account for max 30% PAYE rate
  const tolerance = 0.01;
  let iterations = 0;
  const maxIterations = 100;
  
  while (upperBound - lowerBound > tolerance && iterations < maxIterations) {
    const midPoint = (lowerBound + upperBound) / 2;
    const calculation = calculatePayrollForAmount(
      midPoint,
      basicPayPortion,
      transportAllowance,
      otherDeductions,
      taxConfig,
      companyTaxSettings
    );
    
    if (calculation.finalNetPay > targetNetAmount) {
      upperBound = midPoint;
    } else {
      lowerBound = midPoint;
    }
    
    iterations++;
  }
  
  const finalGross = (lowerBound + upperBound) / 2;
  const finalCalculation = calculatePayrollForAmount(
    finalGross,
    basicPayPortion,
    transportAllowance,
    otherDeductions,
    taxConfig,
    companyTaxSettings
  );
  
  return {
    grossAmount: Math.round(finalGross),
    calculations: finalCalculation
  };
}

// Complete payroll calculation for a given gross amount
export function calculatePayrollForAmount(
  grossPay: number,
  basicPay: number,
  transportAllowance: number,
  otherDeductions: number,
  taxConfig: TaxConfiguration,
  companyTaxSettings?: PayrollTaxSettings
): PayrollCalculation {
  // Default tax settings (all enabled) if not provided
  const taxSettings = companyTaxSettings || {
    paye: true,
    pension: true,
    maternity: true,
    cbhi: true,
    rama: true
  };
  
  // Calculate other allowances
  const otherAllowances = grossPay - basicPay - transportAllowance;
  
  // 1. Calculate PAYE on total gross pay (only if enabled)
  const payeBeforeReliefs = taxSettings.paye 
    ? calculatePAYE(grossPay, taxConfig.payeBrackets)
    : 0;
  
  // 2. Calculate Pension contributions (on total gross pay, only if enabled)
  const pensionEmployee = taxSettings.pension 
    ? Math.round(grossPay * (taxConfig.pensionRates.employee / 100))
    : 0;
  const pensionEmployer = taxSettings.pension 
    ? Math.round(grossPay * (taxConfig.pensionRates.employer / 100))
    : 0;
  
  // 3. Calculate Maternity contributions (on gross pay excluding transport, only if enabled)
  const maternityBase = grossPay - transportAllowance;
  const maternityEmployee = taxSettings.maternity 
    ? Math.round(maternityBase * (taxConfig.maternityRates.employee / 100))
    : 0;
  const maternityEmployer = taxSettings.maternity 
    ? Math.round(maternityBase * (taxConfig.maternityRates.employer / 100))
    : 0;
  
  // 4. Calculate RAMA contributions (on basic pay only, only if enabled)
  const ramaEmployee = taxSettings.rama 
    ? Math.round(basicPay * (taxConfig.ramaRates.employee / 100))
    : 0;
  const ramaEmployer = taxSettings.rama 
    ? Math.round(basicPay * (taxConfig.ramaRates.employer / 100))
    : 0;
  
  // 5. Calculate net salary before CBHI
  const netBeforeCBHI = grossPay - payeBeforeReliefs - pensionEmployee - maternityEmployee - ramaEmployee;
  
  // 6. Calculate CBHI (on net salary before CBHI, only if enabled)
  const cbhiEmployee = taxSettings.cbhi 
    ? Math.round(Math.max(0, netBeforeCBHI) * (taxConfig.cbhiRates.employee / 100))
    : 0;
  
  // 7. Calculate final net pay
  const finalNetPay = netBeforeCBHI - cbhiEmployee - otherDeductions;
  
  return {
    grossPay: Math.round(grossPay),
    basicPay: Math.round(basicPay),
    transportAllowance: Math.round(transportAllowance),
    otherAllowances: Math.round(otherAllowances),
    payeBeforeReliefs: Math.round(payeBeforeReliefs),
    pensionEmployee,
    pensionEmployer,
    maternityEmployee,
    maternityEmployer,
    ramaEmployee,
    ramaEmployer,
    netBeforeCBHI: Math.round(netBeforeCBHI),
    cbhiEmployee,
    otherDeductions: Math.round(otherDeductions),
    finalNetPay: Math.round(finalNetPay)
  };
}

// Enhanced Payroll CRUD
export async function getPayrolls(companyId: string): Promise<Payroll[]> {
  const q = query(
    collection(db, 'companies', companyId, 'payrolls'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const rawData = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...sanitizeFirestoreData(doc.data()) 
  }));
  
  return validateAndFilterRecords<Payroll>(rawData, validatePayrollRecordAsPayroll, 'Payroll');
}

export async function getPayrollsByStatus(companyId: string, status: string): Promise<Payroll[]> {
  const q = query(
    collection(db, 'companies', companyId, 'payrolls'),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payroll));
}

export async function getStaffPayrollData(companyId: string, payrollId: string): Promise<StaffPayroll[]> {
  const q = query(
    collection(db, 'companies', companyId, 'payrolls', payrollId, 'staff_payroll'),
    orderBy('staffName')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffPayroll));
}

export async function createPayroll(companyId: string, data: Omit<Payroll, 'id'>) {
  const payrollData = {
    ...data,
    companyId,
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const res = await addDoc(collection(db, 'companies', companyId, 'payrolls'), payrollData);
  
  // Log audit action
  await logAuditAction({
    companyId,
    userId: data.createdBy,
    entityType: 'payroll',
    entityId: res.id,
    action: 'create',
    details: { period: data.period },
  });
  
  return res;
}

// Create comprehensive payroll for all staff
export async function createComprehensivePayroll(
  companyId: string,
  period: string,
  createdBy: string,
  taxConfig?: TaxConfiguration
): Promise<string> {
  // Load tax configuration from database if not provided
  const config = taxConfig || await getTaxConfiguration();
  
  // Load company tax settings
  let companyTaxSettings: PayrollTaxSettings | undefined;
  try {
    const companyDoc = await getDoc(doc(db, 'companies', companyId));
    if (companyDoc.exists()) {
      const companyData = companyDoc.data();
      companyTaxSettings = companyData.payrollTaxSettings;
    }
  } catch (error) {
    console.warn('Could not load company tax settings, using defaults:', error);
  }
  
  // Get all active staff
  const staffData = await getStaff(companyId);
  // Ensure staffData is cast to the shared Staff type
  const staff: Staff[] = Array.isArray(staffData)
    ? staffData.map(s => ({
        id: s.id,
        companyId: s.companyId,
        personalDetails: s.personalDetails,
        employmentDetails: s.employmentDetails,
        bankDetails: s.bankDetails,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    : (staffData.data ?? []).map((s: any) => ({
        id: s.id,
        companyId: s.companyId,
        personalDetails: s.personalDetails,
        employmentDetails: s.employmentDetails,
        bankDetails: s.bankDetails,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }));
  if (staff.length === 0) {
    throw new Error('No staff found for payroll processing');
  }
  
  // Create payroll record
  const payrollData: Omit<Payroll, 'id'> = {
    companyId,
    period,
    status: 'draft',
    totalGrossPay: 0,
    totalNetPay: 0,
    totalEmployeeTax: 0,
    totalEmployerContributions: 0,
    staffCount: staff.length,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const payrollRef = await createPayroll(companyId, payrollData);
  const payrollId = payrollRef.id;
  
  // Process each staff member
  const batch = writeBatch(db);
  let totalGross = 0;
  let totalNet = 0;
  let totalEmployeeTax = 0;
  let totalEmployerContributions = 0;
  
  for (const staffMember of staff) {
    try {
      // Get staff payments
      const { total: totalPayments, breakdown: payments } = await calculateStaffPayments(
        companyId,
        staffMember.id!,
        period
      );
      
      // Get staff deductions
      const { total: totalDeductions } = await calculateStaffDeductions(
        companyId,
        staffMember.id!
      );
      
      // Calculate basic pay (assume 60% of total payments if not specified)
      const basicPay = payments.find(p => p.type === 'basic_salary')?.amount || totalPayments * 0.6;
      const transportAllowance = payments.find(p => p.type === 'transport_allowance')?.amount || 0;
      
      // Calculate payroll
      const calculation = calculatePayrollForAmount(
        totalPayments,
        basicPay,
        transportAllowance,
        totalDeductions,
        config,
        companyTaxSettings
      );
      
      // Create staff payroll record
      const staffPayrollData: Omit<StaffPayroll, 'id'> = {
        payrollId,
        staffId: staffMember.id!,
        staffName: `${staffMember.personalDetails?.firstName || ''} ${staffMember.personalDetails?.lastName || ''}`.trim(),
        calculations: calculation,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const staffPayrollRef = doc(
        collection(db, 'companies', companyId, 'payrolls', payrollId, 'staff_payroll')
      );
      batch.set(staffPayrollRef, staffPayrollData);
      
      // Update totals
      totalGross += calculation.grossPay;
      totalNet += calculation.finalNetPay;
      totalEmployeeTax += calculation.payeBeforeReliefs + calculation.pensionEmployee + 
                         calculation.maternityEmployee + calculation.ramaEmployee + calculation.cbhiEmployee;
      totalEmployerContributions += calculation.pensionEmployer + calculation.maternityEmployer + 
                                   calculation.ramaEmployer;
      
    } catch (error) {
      console.error(`Error processing payroll for staff ${staffMember.id}:`, error);
      // Continue with other staff members
    }
  }
  
  // Update payroll totals
  const payrollUpdateData = {
    totalGrossPay: totalGross,
    totalNetPay: totalNet,
    totalEmployeeTax: totalEmployeeTax,
    totalEmployerContributions: totalEmployerContributions,
    updatedAt: new Date().toISOString(),
  };
  
  batch.update(doc(db, 'companies', companyId, 'payrolls', payrollId), payrollUpdateData);
  
  // Commit all changes
  await batch.commit();
  
  return payrollId;
}

export async function updatePayroll(companyId: string, payrollId: string, data: Partial<Payroll>) {
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return updateDoc(doc(db, 'companies', companyId, 'payrolls', payrollId), updateData);
}

export async function deletePayroll(companyId: string, payrollId: string) {
  // Get payroll status before deletion to check if deduction balances need reversal
  const payroll = await getPayroll(companyId, payrollId);
  
  // If payroll was processed, reverse the deduction balance updates
  if (payroll && payroll.status === 'processed') {
    await updateDeductionBalancesForPayroll(companyId, payrollId, 'reverse');
  }
  
  return deleteDoc(doc(db, 'companies', companyId, 'payrolls', payrollId));
}

export async function getPayroll(companyId: string, payrollId: string): Promise<Payroll | null> {
  const d = await getDoc(doc(db, 'companies', companyId, 'payrolls', payrollId));
  return d.exists() ? { id: d.id, ...d.data() } as Payroll : null;
}

// Enhanced approval workflow functions
export async function submitPayrollForApproval(
  companyId: string,
  payrollId: string,
  userId: string
): Promise<void> {
  const payroll = await getPayroll(companyId, payrollId);
  if (!payroll) {throw new Error('Payroll not found');}
  if (payroll.status !== 'draft') {throw new Error('Only draft payrolls can be submitted for approval');}
  
  await updatePayroll(companyId, payrollId, {
    status: 'pending_approval',
    updatedAt: new Date().toISOString(),
  });
  
  await logAuditAction({
    companyId,
    userId,
    entityType: 'payroll',
    entityId: payrollId,
    action: 'create', // Using 'create' as 'submit' might not be in the enum
    details: { action: 'submitted_for_approval', period: payroll.period },
  });
}
