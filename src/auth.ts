// Authentication and role-based access logic
// This will use Firebase Authentication for user login and JWT/session management

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { UserRole } from './types';
const db = getFirestore();
// Sign up and assign primary_admin if first user
export async function signUp(email: string, password: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  // Check if this is the first user
  const usersSnap = await getDocs(collection(db, 'app_settings', 'users'));
  const isFirstUser = usersSnap.empty;
  const role: UserRole = isFirstUser ? 'primary_admin' : 'company_admin';
  // Save user profile
  await setDoc(doc(db, 'app_settings', 'users', userCred.user.uid), {
    id: userCred.user.uid,
    email: userCred.user.email,
    name: userCred.user.displayName || '',
    role,
    companyIds: [],
    profileData: {},
  });
  return userCred;
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function onUserChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { auth };
