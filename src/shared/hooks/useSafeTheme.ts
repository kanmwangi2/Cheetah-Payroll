/**
 * Safe Theme Hook
 * Provides theme functionality that works even without ThemeProvider context
 */

import { useThemeContext } from '../../core/providers/ThemeProvider';
import { logger } from '../utils/logger';

interface SafeThemeResult {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  hasProvider: boolean;
}

/**
 * Safe theme hook that provides fallback values when ThemeProvider is not available
 */
export const useSafeTheme = (): SafeThemeResult => {
  try {
    const context = useThemeContext();
    return {
      ...context,
      hasProvider: true,
    };
  } catch (error) {
    // Log once per session to avoid spam
    if (!window.__themeProviderWarningShown) {
      logger.warn('ThemeProvider not found, using fallback theme values');
      window.__themeProviderWarningShown = true;
    }

    // Detect system theme as fallback
    const prefersDark = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : false;

    return {
      theme: 'system',
      resolvedTheme: prefersDark ? 'dark' : 'light',
      isDark: prefersDark,
      isLight: !prefersDark,
      isSystemTheme: true,
      setTheme: () => logger.warn('setTheme unavailable without ThemeProvider'),
      toggleTheme: () => logger.warn('toggleTheme unavailable without ThemeProvider'),
      hasProvider: false,
    };
  }
};

/**
 * Hook that only returns basic theme information without context dependency
 */
export const useBasicTheme = () => {
  const prefersDark = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches 
    : false;

  return {
    isDark: prefersDark,
    isLight: !prefersDark,
    resolvedTheme: prefersDark ? 'dark' : 'light' as const,
  };
};

export default useSafeTheme;

// Extend window interface for warning flag
declare global {
  interface Window {
    __themeProviderWarningShown?: boolean;
  }
}