/**
 * Theme-specific Error Boundary
 * Handles theme context errors and provides appropriate fallbacks
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ThemeProvider } from '../../../core/providers/ThemeProvider';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallbackTheme?: 'light' | 'dark' | 'system';
}

interface State {
  hasThemeError: boolean;
  error?: Error;
}

export class ThemeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasThemeError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if this is a theme context error
    const isThemeError = error.message?.includes('useThemeContext must be used within a ThemeProvider') ||
                        error.message?.includes('ThemeProvider') ||
                        error.message?.includes('theme context');

    if (isThemeError) {
      return { hasThemeError: true, error };
    }

    // If not a theme error, don't handle it here
    throw error;
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Theme context error caught by ThemeErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ThemeErrorBoundary',
    });

    // Additional theme-specific error handling
    if (this.state.hasThemeError) {
      logger.warn('Providing fallback ThemeProvider due to context error');
    }
  }

  public render() {
    if (this.state.hasThemeError) {
      // Wrap children with ThemeProvider as fallback
      return (
        <ThemeProvider defaultTheme={this.props.fallbackTheme || 'system'}>
          <div style={{ 
            padding: '16px', 
            backgroundColor: 'var(--color-warning-bg, #fef3c7)', 
            color: 'var(--color-warning-text, #92400e)',
            border: '1px solid var(--color-warning-border, #fbbf24)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            ⚠️ Theme context was restored automatically. Some functionality may be limited.
          </div>
          {this.props.children}
        </ThemeProvider>
      );
    }

    return this.props.children;
  }
}

export default ThemeErrorBoundary;