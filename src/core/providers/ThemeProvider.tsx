/**
 * Theme Provider
 * Provides theme context to the entire application with enhanced features
 */

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useTheme, Theme, ResolvedTheme } from '../../shared/hooks/useTheme';
import { logger } from '../../shared/utils/logger';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  isSystemTheme: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  enableTransitions?: boolean;
  storageKey?: string;
  attribute?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  enableTransitions = true,
  storageKey = 'cheetah-payroll-theme',
  attribute = 'class',
}) => {
  const themeState = useTheme({
    defaultTheme,
    enableSystem,
    enableTransitions,
    storageKey,
    attribute,
  });

  // Load theme CSS on mount
  useEffect(() => {
    const loadThemeCSS = async () => {
      try {
        // Only import CSS in browser environment, not during tests
        if (typeof window !== 'undefined' && !process.env.NODE_ENV?.includes('test')) {
          await import('../../assets/styles/themes.css');
          logger.debug('Theme CSS loaded successfully');
        }
      } catch (error) {
        // Don't log CSS import errors in test environment
        if (!process.env.NODE_ENV?.includes('test')) {
          logger.error('Failed to load theme CSS', error as Error);
        }
      }
    };

    loadThemeCSS();
  }, []);

  // Log theme changes in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Theme state updated', {
        theme: themeState.theme,
        resolvedTheme: themeState.resolvedTheme,
        systemTheme: themeState.systemTheme,
        isSystemTheme: themeState.isSystemTheme,
      });
    }
  }, [themeState.theme, themeState.resolvedTheme, themeState.systemTheme, themeState.isSystemTheme]);

  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Log the error for debugging
    logger.error('useThemeContext called outside of ThemeProvider', new Error('Missing ThemeProvider'));
    
    // Instead of throwing, provide a fallback theme context
    logger.warn('Using fallback theme context. Please ensure ThemeProvider wraps your component.');
    
    // Return a fallback context with default values
    return {
      theme: 'light' as Theme,
      resolvedTheme: 'light' as ResolvedTheme,
      systemTheme: 'light' as ResolvedTheme,
      isSystemTheme: false,
      setTheme: () => logger.warn('setTheme called outside ThemeProvider'),
      toggleTheme: () => logger.warn('toggleTheme called outside ThemeProvider'),
      isDark: false,
      isLight: true,
    };
  }
  return context;
};

// Hook for accessing theme values in components
export const useThemeValues = () => {
  const context = useThemeContext();

  return {
    // Theme state
    ...context,

    // CSS custom property helpers
    getCSSVariable: (name: string) => {
      if (typeof window === 'undefined') { return ''; }
      return getComputedStyle(document.documentElement).getPropertyValue(name);
    },

    // Theme-aware color helpers
    getThemeColor: (colorName: string) => {
      if (typeof window === 'undefined') { return ''; }
      return getComputedStyle(document.documentElement).getPropertyValue(`--color-${colorName}`);
    },

    // Theme classes
    themeClass: `theme-${context.resolvedTheme}`,

    // Conditional theme values
    themeValue: <T,>(lightValue: T, darkValue: T): T => {
      return context.isDark ? darkValue : lightValue;
    },
  };
};

export default ThemeProvider;
