/**
 * App Provider
 * Root provider that wraps the entire application with necessary contexts
 */

import React, { ReactNode } from 'react';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { logger } from '../../shared/utils/logger';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Application error caught by root boundary', error, {
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppProvider;
