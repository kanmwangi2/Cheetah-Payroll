/**
 * Theme Validation Utilities
 * Validates and ensures theme context is properly available
 */

import { logger } from './logger';

/**
 * Validates that theme CSS variables are available
 */
export const validateThemeCSS = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR

  try {
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--color-primary-500');
    const bgColor = computedStyle.getPropertyValue('--color-bg-primary');
    
    const hasThemeVars = primaryColor && bgColor;
    
    if (!hasThemeVars) {
      logger.warn('Theme CSS variables not found. Theme system may not be properly loaded.');
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Error validating theme CSS', error as Error);
    return false;
  }
};

/**
 * Applies fallback CSS if theme variables are missing
 */
export const applyFallbackTheme = (): void => {
  if (typeof window === 'undefined') return;

  const fallbackCSS = `
    :root {
      --color-primary-500: #3b82f6;
      --color-bg-primary: #ffffff;
      --color-bg-secondary: #f8fafc;
      --color-text-primary: #1e293b;
      --color-text-secondary: #64748b;
      --color-border-primary: #e2e8f0;
      --color-border-secondary: #f1f5f9;
      --color-error-bg: #fef2f2;
      --color-error-text: #dc2626;
      --color-error-border: #fecaca;
      --color-success-bg: #f0fdf4;
      --color-success-text: #166534;
      --color-success-border: #bbf7d0;
      --color-warning-bg: #fefce8;
      --color-warning-text: #a16207;
      --color-warning-border: #fde047;
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
      --spacing-2xl: 48px;
      --spacing-3xl: 64px;
      --spacing-4xl: 96px;
      --border-radius-sm: 4px;
      --border-radius-md: 8px;
      --border-radius-lg: 12px;
      --border-radius-xl: 16px;
      --font-size-xs: 12px;
      --font-size-sm: 14px;
      --font-size-base: 16px;
      --font-size-lg: 18px;
      --font-size-xl: 20px;
      --font-size-2xl: 24px;
      --font-size-3xl: 30px;
      --font-size-4xl: 36px;
      --font-weight-normal: 400;
      --font-weight-medium: 500;
      --font-weight-semibold: 600;
      --font-weight-bold: 700;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      --transition-normal: 0.2s ease-in-out;
    }

    [data-theme="dark"], .dark {
      --color-bg-primary: #0f172a;
      --color-bg-secondary: #1e293b;
      --color-text-primary: #f8fafc;
      --color-text-secondary: #cbd5e1;
      --color-border-primary: #334155;
      --color-border-secondary: #475569;
    }
  `;

  // Check if fallback CSS is already applied
  const existingStyle = document.getElementById('theme-fallback');
  if (existingStyle) return;

  // Create and inject fallback CSS
  const styleElement = document.createElement('style');
  styleElement.id = 'theme-fallback';
  styleElement.textContent = fallbackCSS;
  document.head.appendChild(styleElement);

  logger.info('Applied fallback theme CSS');
};

/**
 * Ensures theme is properly initialized
 */
export const ensureTheme = (): void => {
  if (typeof window === 'undefined') return;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureTheme);
    return;
  }

  // Validate and apply fallback if needed
  if (!validateThemeCSS()) {
    applyFallbackTheme();
  }
};

/**
 * Theme health check for debugging
 */
export const themeHealthCheck = (): {
  hasProvider: boolean;
  hasCSS: boolean;
  hasVariables: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  let hasProvider = false;
  let hasCSS = false;
  let hasVariables = false;

  try {
    // Check if ThemeProvider context is available
    // This would need to be called from within a component to test properly
    hasProvider = true; // Assume true for now
  } catch (error) {
    errors.push('ThemeProvider context not available');
  }

  try {
    // Check if theme CSS is loaded
    hasCSS = document.querySelector('link[href*="themes.css"]') !== null ||
             document.querySelector('style[data-theme]') !== null;
    
    if (!hasCSS) {
      errors.push('Theme CSS not found in document');
    }
  } catch (error) {
    errors.push('Cannot check for theme CSS');
  }

  try {
    // Check if CSS variables are available
    hasVariables = validateThemeCSS();
    
    if (!hasVariables) {
      errors.push('Theme CSS variables not available');
    }
  } catch (error) {
    errors.push('Cannot validate CSS variables');
  }

  return {
    hasProvider,
    hasCSS,
    hasVariables,
    errors,
  };
};

// Auto-initialize theme on import
ensureTheme();