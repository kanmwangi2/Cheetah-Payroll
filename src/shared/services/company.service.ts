// Company and user management logic
// Firestore integration for CRUD operations

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
} from 'firebase/firestore';
import { db } from '../../core/config/firebase.config';
// Note: Company and User types are used in JSDoc comments

export async function getCompaniesForUser(userId: string) {
  const q = query(collection(db, 'companies'), where('userIds', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createCompany(data: Record<string, any>) {
  return addDoc(collection(db, 'companies'), data);
}

export async function updateCompany(companyId: string, data: Record<string, any>) {
  return updateDoc(doc(db, 'companies', companyId), data);
}

export async function deleteCompany(companyId: string) {
  return deleteDoc(doc(db, 'companies', companyId));
}

export async function getCompany(companyId: string) {
  const d = await getDoc(doc(db, 'companies', companyId));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}
// ...existing code...

// User management (simplified)
export async function getUsersForCompany(companyId: string) {
  const snapshot = await getDocs(collection(db, 'companies', companyId, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
// ...existing code...

export async function createUser(companyId: string, data: Record<string, any>) {
  return addDoc(collection(db, 'companies', companyId, 'users'), data);
}
// ...existing code...

export async function updateUser(companyId: string, userId: string, data: Record<string, any>) {
  return updateDoc(doc(db, 'companies', companyId, 'users', userId), data);
}
// ...existing code...

export async function deleteUser(companyId: string, userId: string) {
  return deleteDoc(doc(db, 'companies', companyId, 'users', userId));
}
// End of file
