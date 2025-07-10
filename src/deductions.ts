// Deductions management logic (CRUD, import/export)
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export async function getDeductions(companyId: string) {
  const snapshot = await getDocs(collection(db, 'companies', companyId, 'deductions'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createDeduction(companyId: string, data: any) {
  return addDoc(collection(db, 'companies', companyId, 'deductions'), data);
}

export async function updateDeduction(companyId: string, deductionId: string, data: any) {
  return updateDoc(doc(db, 'companies', companyId, 'deductions', deductionId), data);
}

export async function deleteDeduction(companyId: string, deductionId: string) {
  return deleteDoc(doc(db, 'companies', companyId, 'deductions', deductionId));
}

export async function getDeduction(companyId: string, deductionId: string) {
  const d = await getDoc(doc(db, 'companies', companyId, 'deductions', deductionId));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}
