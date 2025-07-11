/**
 * Theme Hook
 * Manages theme state and system preference detection with enhanced features
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  isSystemTheme: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

interface ThemeConfig {
  storageKey?: string;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  enableTransitions?: boolean;
}

const DEFAULT_CONFIG: Required<ThemeConfig> = {
  storageKey: 'theme',
  attribute: 'class',
  defaultTheme: 'system',
  enableSystem: true,
  enableTransitions: true,
};

export const useTheme = (config: ThemeConfig = {}): ThemeState => {
  const { storageKey, attribute, defaultTheme, enableSystem, enableTransitions } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Initialize theme from storage or default
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      if (typeof window === 'undefined') {return defaultTheme;}

      const savedTheme = localStorage.getItem(storageKey) as Theme;
      const validThemes: Theme[] = ['light', 'dark', 'system'];

      if (savedTheme && validThemes.includes(savedTheme)) {
        return savedTheme;
      }

      return defaultTheme;
    } catch (error) {
      logger.warn('Failed to read theme from localStorage', error as Error);
      return defaultTheme;
    }
  });

  // Initialize system theme detection
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') {return 'light';}

    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (error) {
      logger.warn('Failed to detect system theme', error as Error);
      return 'light';
    }
  });

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') {return;}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);

      logger.debug('System theme changed', {
        newTheme: newSystemTheme,
        currentTheme: theme,
      });
    };

    // Use the newer addEventListener if available, fallback to deprecated addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // @ts-ignore - For older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore - For older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [enableSystem, theme]);

  // Calculate resolved theme
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;
  const isSystemTheme = theme === 'system';
  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') {return;}

    const applyTheme = () => {
      const root = document.documentElement;
      const body = document.body;

      // Remove existing theme classes
      body.classList.remove('theme-light', 'theme-dark');
      root.classList.remove('theme-light', 'theme-dark');

      // Add new theme class
      const themeClass = `theme-${resolvedTheme}`;

      if (attribute === 'class') {
        body.classList.add(themeClass);
        root.classList.add(themeClass);
      } else {
        root.setAttribute(attribute, resolvedTheme);
      }

      // Set color-scheme for better browser integration
      root.style.colorScheme = resolvedTheme;

      // Disable transitions temporarily to prevent flash
      if (enableTransitions) {
        const css = document.createElement('style');
        css.appendChild(document.createTextNode(`* { transition: none !important; }`));
        document.head.appendChild(css);

        // Re-enable transitions after a short delay
        setTimeout(() => {
          document.head.removeChild(css);
        }, 1);
      }

      logger.debug('Theme applied', {
        theme,
        resolvedTheme,
        systemTheme,
        isSystemTheme,
      });
    };

    applyTheme();
  }, [theme, resolvedTheme, attribute, enableTransitions]);

  // Persist theme to storage
  useEffect(() => {
    if (typeof window === 'undefined') {return;}

    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      logger.warn('Failed to save theme to localStorage', error as Error);
    }
  }, [theme, storageKey]);

  // Set theme function
  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (newTheme === theme) {return;}

      const validThemes: Theme[] = ['light', 'dark', 'system'];
      if (!validThemes.includes(newTheme)) {
        logger.warn('Invalid theme provided', { theme: newTheme });
        return;
      }

      setThemeState(newTheme);
      logger.info('Theme changed', {
        from: theme,
        to: newTheme,
        resolvedTheme: newTheme === 'system' ? systemTheme : newTheme,
      });
    },
    [theme, systemTheme]
  );

  // Toggle theme function (cycles through light -> dark -> system)
  const toggleTheme = useCallback(() => {
    const themeOrder: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];

    setTheme(nextTheme);
  }, [theme, setTheme]);

  return {
    theme,
    resolvedTheme,
    systemTheme,
    isSystemTheme,
    setTheme,
    toggleTheme,
    isDark,
    isLight,
  };
};

export default useTheme;
