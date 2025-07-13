/**
 * Role-based Access Control Guard
 * Protects components based on user roles
 */

import React, { ReactNode } from 'react';
import { useAuthContext } from '../providers/AuthProvider';
import { UserRole } from '../../shared/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles, otherwise ANY role
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  requireAll = false,
}) => {
  const { user } = useAuthContext();

  if (!user) {
    return (
      fallback || (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--color-error-text)',
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            borderRadius: '4px',
            margin: '20px',
          }}
        >
          <h3>Access Denied</h3>
          <p>You must be logged in to access this content.</p>
        </div>
      )
    );
  }

  const hasRequiredRole = requireAll
    ? allowedRoles.every(role => user.role === role)
    : allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    return (
      fallback || (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--color-error-text)',
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            borderRadius: '4px',
            margin: '20px',
          }}
        >
          <h3>Access Denied</h3>
          <p>You don't have permission to access this content.</p>
          <p>Required roles: {allowedRoles.join(', ')}</p>
          <p>Your role: {user.role}</p>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
