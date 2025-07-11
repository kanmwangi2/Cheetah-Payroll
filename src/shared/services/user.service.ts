import { doc, getDoc, collection, getDocs, setDoc, query, limit } from 'firebase/firestore';
import { db } from '../../core/config/firebase.config';
import { User, Company } from '../types';

export async function getUserProfile(userId: string): Promise<User | null> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
}

export async function createUserProfile(userData: {
  id: string;
  email: string;
  name: string;
}): Promise<User> {
  // Check if this is the first user in the system
  const usersRef = collection(db, 'users');
  const firstUserQuery = query(usersRef, limit(1));
  const existingUsers = await getDocs(firstUserQuery);
  
  // First user gets primary_admin role, others get company_admin
  const isFirstUser = existingUsers.empty;
  const role = isFirstUser ? 'primary_admin' : 'company_admin';
  
  const newUser: User = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role,
    companyIds: [],
    profileData: {}
  };
  
  // Save to Firestore
  const userRef = doc(db, 'users', userData.id);
  await setDoc(userRef, newUser);
  
  return newUser;
}

export async function getCompaniesByIds(companyIds: string[]): Promise<Company[]> {
  if (!companyIds.length) return [];
  const companiesRef = collection(db, 'companies');
  const allCompaniesSnap = await getDocs(companiesRef);
  return allCompaniesSnap.docs
    .filter(doc => companyIds.includes(doc.id))
    .map(doc => ({ id: doc.id, ...doc.data() }) as Company);
}
