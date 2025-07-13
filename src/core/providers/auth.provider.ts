/**
 * Authentication Provider Service
 * Handles Firebase authentication and user management
 */

import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import { UserRole } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export const onUserChanged = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const signInUser = async (email: string, password: string) => {
  try {
    logger.info('Attempting to sign in user', { email });
    const result = await signInWithEmailAndPassword(auth, email, password);
    logger.info('User signed in successfully', { uid: result.user.uid });
    return result;
  } catch (error) {
    logger.error('Failed to sign in user', error as Error, { email });
    throw error;
  }
};

export const signUpUser = async (email: string, password: string, name: string) => {
  try {
    logger.info('Attempting to sign up user', { email, name });

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Check if this is the first user
    const usersSnap = await getDocs(collection(db, 'users'));
    const isFirstUser = usersSnap.empty;
    const role: UserRole = isFirstUser ? 'primary_admin' : 'company_admin';

    logger.info('Creating user profile', {
      uid: userCred.user.uid,
      role,
      isFirstUser,
    });

    // Save user profile
    await setDoc(doc(db, 'users', userCred.user.uid), {
      id: userCred.user.uid,
      email: userCred.user.email,
      name: name || '',
      role,
      companyIds: [],
      profileData: {},
    });

    logger.info('User signed up successfully', { uid: userCred.user.uid });
    return userCred;
  } catch (error) {
    logger.error('Failed to sign up user', error as Error, { email, name });
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    logger.info('Attempting to sign out user');
    await signOut(auth);
    logger.info('User signed out successfully');
  } catch (error) {
    logger.error('Failed to sign out user', error as Error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    logger.info('Attempting to reset password', { email });
    await sendPasswordResetEmail(auth, email);
    logger.info('Password reset email sent successfully', { email });
  } catch (error) {
    logger.error('Failed to send password reset email', error as Error, { email });
    throw error;
  }
};

