import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { User, Company } from './types';

const db = getFirestore();

export async function getUserProfile(userId: string): Promise<User | null> {
  const ref = doc(db, 'app_settings', 'users', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
}

export async function getCompaniesByIds(companyIds: string[]): Promise<Company[]> {
  if (!companyIds.length) return [];
  const companiesRef = collection(db, 'companies');
  const allCompaniesSnap = await getDocs(companiesRef);
  return allCompaniesSnap.docs
    .filter(doc => companyIds.includes(doc.id))
    .map(doc => ({ id: doc.id, ...doc.data() } as Company));
}
