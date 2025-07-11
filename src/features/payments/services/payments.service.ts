// Payments management logic (CRUD, import/export)
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

const db = getFirestore();

export async function getPayments(companyId: string) {
  const snapshot = await getDocs(collection(db, 'companies', companyId, 'payments'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createPayment(companyId: string, data: any) {
  return addDoc(collection(db, 'companies', companyId, 'payments'), data);
}

export async function updatePayment(companyId: string, paymentId: string, data: any) {
  return updateDoc(doc(db, 'companies', companyId, 'payments', paymentId), data);
}

export async function deletePayment(companyId: string, paymentId: string) {
  return deleteDoc(doc(db, 'companies', companyId, 'payments', paymentId));
}

export async function getPayment(companyId: string, paymentId: string) {
  const d = await getDoc(doc(db, 'companies', companyId, 'payments', paymentId));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}
