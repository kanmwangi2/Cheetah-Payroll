// Deductions management logic (CRUD, import/export)
import {
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
import { Deduction, DeductionType } from '../../../shared/types';
import { logAuditAction } from '../../../shared/services/audit.service';
import { validateDeductionRecordAsDeduction, validateAndFilterRecords, sanitizeFirestoreData } from '../../../shared/utils/data-validation';

// Deduction type labels
export const DEDUCTION_TYPE_LABELS: Record<DeductionType, string> = {
  advance: 'Advance',
  loan: 'Loan',
  other_charge: 'Other Charge',
  disciplinary_deduction: 'Disciplinary Deduction',
};

export function formatDeductionType(type: DeductionType): string {
  return DEDUCTION_TYPE_LABELS[type] || type;
}

export async function getDeductions(companyId: string): Promise<Deduction[]> {
  const q = query(
    collection(db, 'companies', companyId, 'deductions'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const rawData = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...sanitizeFirestoreData(doc.data()) 
  }));
  
  return validateAndFilterRecords<Deduction>(rawData, validateDeductionRecordAsDeduction, 'Deduction');
}

export async function getActiveDeductions(companyId: string): Promise<Deduction[]> {
  const q = query(
    collection(db, 'companies', companyId, 'deductions'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deduction));
}

export async function getDeductionsByStaff(companyId: string, staffId: string): Promise<Deduction[]> {
  const q = query(
    collection(db, 'companies', companyId, 'deductions'),
    where('staffId', '==', staffId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deduction));
}

export async function getLoansByStaff(companyId: string, staffId: string): Promise<Deduction[]> {
  const q = query(
    collection(db, 'companies', companyId, 'deductions'),
    where('staffId', '==', staffId),
    where('type', '==', 'loan'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deduction));
}

export async function createDeduction(companyId: string, data: Omit<Deduction, 'id'>, userId?: string) {
  const deductionData = {
    ...data,
    companyId,
    remainingBalance: data.originalAmount, // Initialize remaining balance
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Calculate installment details for loans
  if (data.type === 'loan' && data.numberOfInstallments && data.numberOfInstallments > 0) {
    deductionData.monthlyInstallment = Math.ceil(data.originalAmount / data.numberOfInstallments);
    deductionData.remainingInstallments = data.numberOfInstallments;
  }
  
  const docRef = await addDoc(collection(db, 'companies', companyId, 'deductions'), deductionData);
  
  // Log audit action
  if (userId) {
    await logAuditAction({
      companyId,
      userId,
      entityType: 'deduction',
      entityId: docRef.id,
      action: 'create',
      details: { type: data.type, amount: data.originalAmount, staffId: data.staffId },
    });
  }
  
  return docRef;
}

export async function updateDeduction(companyId: string, deductionId: string, data: Partial<Deduction>, userId?: string) {
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  const result = await updateDoc(doc(db, 'companies', companyId, 'deductions', deductionId), updateData);
  
  // Log audit action
  if (userId) {
    await logAuditAction({
      companyId,
      userId,
      entityType: 'deduction',
      entityId: deductionId,
      action: 'update',
      details: { changes: Object.keys(data) },
    });
  }
  
  return result;
}

export async function deleteDeduction(companyId: string, deductionId: string, userId?: string) {
  // Soft delete by setting status to cancelled
  return updateDeduction(companyId, deductionId, { 
    status: 'cancelled',
    updatedAt: new Date().toISOString()
  }, userId);
}

export async function hardDeleteDeduction(companyId: string, deductionId: string, userId?: string) {
  // Get deduction info before deletion for audit
  const deductionDoc = await getDoc(doc(db, 'companies', companyId, 'deductions', deductionId));
  const deductionData = deductionDoc.exists() ? deductionDoc.data() : null;
  
  const result = await deleteDoc(doc(db, 'companies', companyId, 'deductions', deductionId));
  
  // Log audit action
  if (userId) {
    await logAuditAction({
      companyId,
      userId,
      entityType: 'deduction',
      entityId: deductionId,
      action: 'delete',
      details: { type: deductionData?.type, amount: deductionData?.originalAmount },
    });
  }
  
  return result;
}

export async function getDeduction(companyId: string, deductionId: string): Promise<Deduction | null> {
  const d = await getDoc(doc(db, 'companies', companyId, 'deductions', deductionId));
  return d.exists() ? { id: d.id, ...d.data() } as Deduction : null;
}

// Alias for consistency with other components
export async function getDeductionById(companyId: string, deductionId: string): Promise<Deduction | null> {
  return getDeduction(companyId, deductionId);
}

// Loan management functions
export async function processLoanPayment(companyId: string, deductionId: string, paymentAmount: number): Promise<void> {
  const deduction = await getDeduction(companyId, deductionId);
  if (!deduction) {throw new Error('Deduction not found');}
  
  // Validate the payment amount
  const validationError = validateDeductionPayment(deduction, paymentAmount);
  if (validationError) {
    throw new Error(validationError);
  }
  
  const newBalance = Math.max(0, deduction.remainingBalance - paymentAmount);
  const isCompleted = newBalance === 0;
  
  const updateData: Partial<Deduction> = {
    remainingBalance: newBalance,
    updatedAt: new Date().toISOString(),
  };
  
  if (deduction.type === 'loan' && deduction.remainingInstallments) {
    updateData.remainingInstallments = Math.max(0, deduction.remainingInstallments - 1);
  }
  
  if (isCompleted) {
    updateData.status = 'completed';
  }
  
  await updateDeduction(companyId, deductionId, updateData);
}

export async function reverseLoanPayment(companyId: string, deductionId: string, paymentAmount: number): Promise<void> {
  const deduction = await getDeduction(companyId, deductionId);
  if (!deduction) {throw new Error('Deduction not found');}
  
  const newBalance = Math.min(deduction.originalAmount, deduction.remainingBalance + paymentAmount);
  
  const updateData: Partial<Deduction> = {
    remainingBalance: newBalance,
    status: 'active',
    updatedAt: new Date().toISOString(),
  };
  
  if (deduction.type === 'loan' && deduction.numberOfInstallments) {
    const remainingInstallments = Math.ceil(newBalance / (deduction.monthlyInstallment || 1));
    updateData.remainingInstallments = Math.min(remainingInstallments, deduction.numberOfInstallments);
  }
  
  await updateDeduction(companyId, deductionId, updateData);
}

// Calculate total deductions for a staff member
export async function calculateStaffDeductions(companyId: string, staffId: string): Promise<{ total: number; breakdown: Deduction[] }> {
  const deductions = await getDeductionsByStaff(companyId, staffId);
  
  // Calculate monthly deduction amounts
  const monthlyDeductions = deductions.map(d => {
    if (d.type === 'loan' && d.monthlyInstallment) {
      return Math.min(d.monthlyInstallment, d.remainingBalance);
    }
    return d.remainingBalance; // For one-time deductions
  });
  
  const total = monthlyDeductions.reduce((sum, amount) => sum + amount, 0);
  
  return {
    total,
    breakdown: deductions
  };
}

// Bulk operations
export async function bulkProcessLoanPayments(companyId: string, payments: Array<{ deductionId: string; amount: number }>): Promise<void> {
  const batch = writeBatch(db);
  
  for (const payment of payments) {
    const deduction = await getDeduction(companyId, payment.deductionId);
    if (!deduction) {continue;}
    
    const newBalance = Math.max(0, deduction.remainingBalance - payment.amount);
    const isCompleted = newBalance === 0;
    
    const updateData: any = {
      remainingBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };
    
    if (deduction.type === 'loan' && deduction.remainingInstallments) {
      updateData.remainingInstallments = Math.max(0, deduction.remainingInstallments - 1);
    }
    
    if (isCompleted) {
      updateData.status = 'completed';
    }
    
    const docRef = doc(db, 'companies', companyId, 'deductions', payment.deductionId);
    batch.update(docRef, updateData);
  }
  
  await batch.commit();
}

// Validation function
export function validateDeduction(deduction: Omit<Deduction, 'id' | 'companyId' | 'remainingBalance' | 'createdAt' | 'updatedAt' | 'status'>): string[] {
  const errors: string[] = [];
  
  if (!deduction.type) {errors.push('Deduction type is required');}
  if (!deduction.staffId) {errors.push('Staff member is required');}
  if (!deduction.originalAmount || deduction.originalAmount <= 0) {errors.push('Amount must be greater than 0');}
  
  if (deduction.type === 'loan') {
    if (deduction.numberOfInstallments && deduction.numberOfInstallments <= 0) {
      errors.push('Number of installments must be greater than 0');
    }
    if (deduction.monthlyInstallment && deduction.monthlyInstallment <= 0) {
      errors.push('Monthly installment must be greater than 0');
    }
  }
  
  return errors;
}

// Balance validation functions
export function validateDeductionPayment(deduction: Deduction, paymentAmount: number): string | null {
  if (paymentAmount <= 0) {
    return 'Payment amount must be greater than 0';
  }
  
  if (paymentAmount > deduction.remainingBalance) {
    return `Payment amount (${paymentAmount.toLocaleString()}) cannot exceed remaining balance (${deduction.remainingBalance.toLocaleString()})`;
  }
  
  return null;
}

export function validateDeductionBalance(deduction: Deduction): string | null {
  if (deduction.remainingBalance < 0) {
    return 'Remaining balance cannot be negative';
  }
  
  if (deduction.remainingBalance > deduction.originalAmount) {
    return 'Remaining balance cannot exceed original amount';
  }
  
  return null;
}

export function canProcessDeduction(deduction: Deduction, amount: number): boolean {
  if (deduction.status !== 'active') {
    return false;
  }
  
  if (deduction.remainingBalance <= 0) {
    return false;
  }
  
  if (amount > deduction.remainingBalance) {
    return false;
  }
  
  return true;
}
