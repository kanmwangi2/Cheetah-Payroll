/**
 * Authentication Hook
 * Provides authentication state and methods
 */

import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../core/config/firebase.config';
import { getUserProfile } from '../services/user.service';
import { User } from '../types';
import { logger } from '../utils/logger';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async firebaseUser => {
      try {
        if (firebaseUser) {
          logger.info('User authenticated', { uid: firebaseUser.uid, email: firebaseUser.email });

          // Get user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);

          setAuthState({
            user: userProfile,
            firebaseUser,
            loading: false,
            error: null,
          });
        } else {
          logger.info('User not authenticated');
          setAuthState({
            user: null,
            firebaseUser: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        logger.error('Error in auth state change', error as Error);
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: (error as Error).message,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
};

export default useAuth;
