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
        // Import the theme CSS file
        await import('../../assets/styles/themes.css');
        logger.debug('Theme CSS loaded successfully');
      } catch (error) {
        logger.error('Failed to load theme CSS', error as Error);
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
  }, [themeState.theme, themeState.resolvedTheme, themeState.systemTheme]);

  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
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
      if (typeof window === 'undefined') return '';
      return getComputedStyle(document.documentElement).getPropertyValue(name);
    },

    // Theme-aware color helpers
    getThemeColor: (colorName: string) => {
      if (typeof window === 'undefined') return '';
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
