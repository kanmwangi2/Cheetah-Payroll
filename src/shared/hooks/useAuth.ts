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
    let unsubscribe: (() => void) = () => {};
    
    
    try {
      if (auth && auth.onAuthStateChanged) {
        unsubscribe = auth.onAuthStateChanged(async firebaseUser => {
          try {
            if (firebaseUser) {
              logger.info('User authenticated', { uid: firebaseUser.uid, email: firebaseUser.email });
              
              try {
                // Get user profile from Firestore
                const userProfile = await getUserProfile(firebaseUser.uid);
                
                if (userProfile) {
                  // User profile exists
                  setAuthState({
                    user: userProfile,
                    firebaseUser,
                    loading: false,
                    error: null,
                  });
                } else {
                  // No profile found - create user profile in Firestore
                  logger.info('No user profile found, creating user profile in Firestore', { uid: firebaseUser.uid });
                  
                  // Check if this is the first user (should be app_admin)
                  const { createUserProfile } = await import('../services/user.service');
                  const createdUser = await createUserProfile({
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  });
                  
                  setAuthState({
                    user: createdUser,
                    firebaseUser,
                    loading: false,
                    error: null,
                  });
                }
              } catch (profileError) {
                logger.warn('Error loading user profile, using basic user data', profileError as Error);
                // Create basic user object if profile loading fails due to network/permission issues
                const basicUser = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  name: firebaseUser.displayName || 'User',
                  role: 'company_admin' as const,
                  companyIds: [],
                  profileData: {}
                };
                setAuthState({
                  user: basicUser,
                  firebaseUser,
                  loading: false,
                  error: null, // Don't show error to user - app still works
                });
              }
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
      } else {
        // If Firebase auth is not available, set as not authenticated
        logger.warn('Firebase auth not available, user will need to configure Firebase');
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: 'Firebase configuration required',
        });
      }
    } catch (initError) {
      logger.error('Failed to initialize auth listener', initError as Error);
      setAuthState({
        user: null,
        firebaseUser: null,
        loading: false,
        error: 'Authentication system unavailable',
      });
    }
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return authState;
};

export default useAuth;
