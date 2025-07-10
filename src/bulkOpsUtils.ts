import { getFirestore, writeBatch, doc } from 'firebase/firestore';

const db = getFirestore();

export async function bulkUpdateStaff(companyId: string, staffIds: string[], updates: any) {
  const batch = writeBatch(db);
  staffIds.forEach(id => {
    batch.update(doc(db, 'companies', companyId, 'staff', id), updates);
  });
  await batch.commit();
}

export async function bulkDeleteStaff(companyId: string, staffIds: string[]) {
  const batch = writeBatch(db);
  staffIds.forEach(id => {
    batch.delete(doc(db, 'companies', companyId, 'staff', id));
  });
  await batch.commit();
}

export async function bulkUpdatePayrolls(companyId: string, payrollIds: string[], updates: any) {
  const batch = writeBatch(db);
  payrollIds.forEach(id => {
    batch.update(doc(db, 'companies', companyId, 'payrolls', id), updates);
  });
  await batch.commit();
}

export async function bulkDeletePayrolls(companyId: string, payrollIds: string[]) {
  const batch = writeBatch(db);
  payrollIds.forEach(id => {
    batch.delete(doc(db, 'companies', companyId, 'payrolls', id));
  });
  await batch.commit();
}
