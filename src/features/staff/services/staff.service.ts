// Staff management logic (CRUD, import/export)
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

export async function getStaff(companyId: string) {
  const snapshot = await getDocs(collection(db, 'companies', companyId, 'staff'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createStaff(companyId: string, data: any) {
  return addDoc(collection(db, 'companies', companyId, 'staff'), data);
}

export async function updateStaff(companyId: string, staffId: string, data: any) {
  return updateDoc(doc(db, 'companies', companyId, 'staff', staffId), data);
}

export async function deleteStaff(companyId: string, staffId: string) {
  return deleteDoc(doc(db, 'companies', companyId, 'staff', staffId));
}

export async function getStaffProfile(companyId: string, staffId: string) {
  const d = await getDoc(doc(db, 'companies', companyId, 'staff', staffId));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}
