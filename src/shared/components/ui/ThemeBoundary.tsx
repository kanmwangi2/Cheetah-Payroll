/**
 * Theme Boundary Component
 * Ensures theme context is available, providing a local ThemeProvider if needed
 */

import React, { ReactNode } from 'react';
import { ThemeProvider, useThemeContext } from '../../../core/providers/ThemeProvider';
import { logger } from '../../utils/logger';

interface ThemeBoundaryProps {
  children: ReactNode;
  fallbackTheme?: 'light' | 'dark' | 'system';
}

/**
 * Component that checks if ThemeProvider is available and provides one if not
 */
const ThemeBoundaryInner: React.FC<ThemeBoundaryProps> = ({ 
  children, 
  fallbackTheme = 'system' 
}) => {
  try {
    // Try to access theme context
    useThemeContext();
    // If successful, context exists - just render children
    return <>{children}</>;
  } catch (error) {
    // No theme context found - provide our own
    logger.warn('ThemeBoundary: No ThemeProvider found, creating local context');
    return (
      <ThemeProvider defaultTheme={fallbackTheme}>
        {children}
      </ThemeProvider>
    );
  }
};

/**
 * Theme Boundary wrapper that ensures theme context is always available
 */
export const ThemeBoundary: React.FC<ThemeBoundaryProps> = ({ 
  children, 
  fallbackTheme = 'system' 
}) => {
  return (
    <ThemeBoundaryInner fallbackTheme={fallbackTheme}>
      {children}
    </ThemeBoundaryInner>
  );
};

export default ThemeBoundary;