/**
 * Firebase Configuration
 * Initializes Firebase app and services
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { config } from './env.config';

// Initialize Firebase
const firebaseApp = initializeApp(config.firebase);

// Initialize Firebase services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Export for testing and advanced usage
export { firebaseApp };
export default firebaseApp;
