// Payments management logic (CRUD, import/export)
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
import { Payment, PaymentType } from '../../../shared/types';
import { logAuditAction } from '../../../shared/services/audit.service';
import { validatePaymentRecord, validateAndFilterRecords, sanitizeFirestoreData } from '../../../shared/utils/data-validation';

// Export utility functions
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  basic_salary: 'Basic Salary',
  transport_allowance: 'Transport Allowance',
  overtime_allowance: 'Overtime Allowance',
  bonus: 'Bonus',
  commission: 'Commission',
  other_allowance: 'Other Allowance',
};

export function formatPaymentType(type: PaymentType): string {
  return PAYMENT_TYPE_LABELS[type] || type;
}

export function validatePayment(payment: Omit<Payment, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): string[] {
  const errors: string[] = [];
  
  if (!payment.type) {errors.push('Payment type is required');}
  if (!payment.staffId) {errors.push('Staff member is required');}
  if (!payment.amount || payment.amount <= 0) {errors.push('Amount must be greater than 0');}
  if (!payment.effectiveDate) {errors.push('Effective date is required');}
  
  if (payment.endDate && payment.endDate <= payment.effectiveDate) {
    errors.push('End date must be after effective date');
  }
  
  return errors;
}

export async function getPayments(companyId: string): Promise<Payment[]> {
  const q = query(
    collection(db, 'companies', companyId, 'payments'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const rawData = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...sanitizeFirestoreData(doc.data()) 
  }));
  
  // Apply strict validation and filter out invalid records
  return validateAndFilterRecords<Payment>(rawData, validatePaymentRecord, 'Payment');
}

export async function getActivePayments(companyId: string): Promise<Payment[]> {
  const q = query(
    collection(db, 'companies', companyId, 'payments'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
}

export async function getPaymentsByStaff(companyId: string, staffId: string): Promise<Payment[]> {
  const q = query(
    collection(db, 'companies', companyId, 'payments'),
    where('staffId', '==', staffId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const rawData = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...sanitizeFirestoreData(doc.data()) 
  }));
  
  return validateAndFilterRecords<Payment>(rawData, validatePaymentRecord, 'Payment');
}

export async function getPaymentsByType(companyId: string, type: PaymentType): Promise<Payment[]> {
  const q = query(
    collection(db, 'companies', companyId, 'payments'),
    where('type', '==', type),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
}

export async function createPayment(companyId: string, data: Omit<Payment, 'id'>, userId?: string) {
  const paymentData = {
    ...data,
    companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, 'companies', companyId, 'payments'), paymentData);
  
  // Log audit action
  if (userId) {
    await logAuditAction({
      companyId,
      userId,
      entityType: 'payment',
      entityId: docRef.id,
      action: 'create',
      details: { type: data.type, amount: data.amount, staffId: data.staffId },
    });
  }
  
  return docRef;
}

export async function updatePayment(companyId: string, paymentId: string, data: Partial<Payment>, userId?: string) {
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  const result = await updateDoc(doc(db, 'companies', companyId, 'payments', paymentId), updateData);
  
  // Log audit action
  if (userId) {
    await logAuditAction({
      companyId,
      userId,
      entityType: 'payment',
      entityId: paymentId,
      action: 'update',
      details: { changes: Object.keys(data) },
    });
  }
  
  return result;
}

export async function deletePayment(companyId: string, paymentId: string, userId?: string) {
  // Get payment info before deletion for audit
  const paymentDoc = await getDoc(doc(db, 'companies', companyId, 'payments', paymentId));
  const paymentData = paymentDoc.exists() ? paymentDoc.data() : null;
  
  const result = await deleteDoc(doc(db, 'companies', companyId, 'payments', paymentId));
  
  // Log audit action
  if (userId) {
    await logAuditAction({
      companyId,
      userId,
      entityType: 'payment',
      entityId: paymentId,
      action: 'delete',
      details: { type: paymentData?.type, amount: paymentData?.amount },
    });
  }
  
  return result;
}

export async function getPayment(companyId: string, paymentId: string): Promise<Payment | null> {
  const d = await getDoc(doc(db, 'companies', companyId, 'payments', paymentId));
  return d.exists() ? { id: d.id, ...d.data() } as Payment : null;
}

// Bulk operations
export async function bulkCreatePayments(companyId: string, payments: Omit<Payment, 'id'>[]): Promise<void> {
  const batch = writeBatch(db);
  
  payments.forEach(payment => {
    const docRef = doc(collection(db, 'companies', companyId, 'payments'));
    const paymentData = {
      ...payment,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(docRef, paymentData);
  });
  
  await batch.commit();
}

export async function bulkUpdatePaymentStatus(companyId: string, paymentIds: string[], status: 'active' | 'inactive'): Promise<void> {
  const batch = writeBatch(db);
  
  paymentIds.forEach(paymentId => {
    const docRef = doc(db, 'companies', companyId, 'payments', paymentId);
    batch.update(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  });
  
  await batch.commit();
}

// Calculate total payments for a staff member
export async function calculateStaffPayments(companyId: string, staffId: string, payrollDate: string): Promise<{ total: number; breakdown: Payment[] }> {
  const payments = await getPaymentsByStaff(companyId, staffId);
  
  // Filter payments that are effective as of the payroll date
  const effectivePayments = payments.filter(p => {
    const effectiveDate = new Date(p.effectiveDate);
    const payrollDateObj = new Date(payrollDate);
    const endDate = p.endDate ? new Date(p.endDate) : null;
    
    return effectiveDate <= payrollDateObj && (!endDate || endDate >= payrollDateObj);
  });
  
  const total = effectivePayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return {
    total,
    breakdown: effectivePayments
  };
}
