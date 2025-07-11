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
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          border: '1px solid #f8bbd9',
          borderRadius: '4px',
          margin: '20px',
        }}
      >
        <h3>Authentication Error</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return fallback || <Login onSuccess={() => window.location.replace('/')} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
