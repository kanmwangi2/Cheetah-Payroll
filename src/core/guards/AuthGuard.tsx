/**
 * Authentication Guard
 * Protects routes that require authentication
 */

import React, { ReactNode } from 'react';
import { useAuthContext } from '../providers/AuthProvider';
import Login from '../../features/auth/components/Login';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { user, loading, error } = useAuthContext();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (error) {
    const isConfigError = error.includes('Firebase configuration') || error.includes('Authentication system unavailable');
    
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-secondary)',
          padding: 'var(--spacing-lg)',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            padding: 'var(--spacing-2xl)',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--border-radius-xl)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
            {isConfigError ? 'Firebase Configuration Required' : 'Authentication Error'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)', lineHeight: '1.5' }}>
            {isConfigError 
              ? 'To use Cheetah Payroll, please configure your Firebase project. Copy .env.example to .env and add your Firebase configuration.'
              : error
            }
          </p>
          {isConfigError && (
            <div style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              <div>1. Copy .env.example to .env</div>
              <div>2. Get Firebase config from Firebase Console</div>
              <div>3. Fill in REACT_APP_FIREBASE_* variables</div>
              <div>4. Restart the development server</div>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || <Login onSuccess={() => window.location.replace('/')} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
