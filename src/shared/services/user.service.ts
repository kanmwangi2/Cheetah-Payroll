import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../core/config/firebase.config';
import { User, Company } from '../types';

export async function getUserProfile(userId: string): Promise<User | null> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
}

export async function getCompaniesByIds(companyIds: string[]): Promise<Company[]> {
  if (!companyIds.length) return [];
  const companiesRef = collection(db, 'companies');
  const allCompaniesSnap = await getDocs(companiesRef);
  return allCompaniesSnap.docs
    .filter(doc => companyIds.includes(doc.id))
    .map(doc => ({ id: doc.id, ...doc.data() }) as Company);
}
