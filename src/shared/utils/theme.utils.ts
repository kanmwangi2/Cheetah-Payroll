/**
 * Theme Utility Functions
 * Helper functions for working with themes and CSS variables
 */

import React from 'react';
import { Theme, ResolvedTheme } from '../hooks/useTheme';

/**
 * Get CSS custom property value
 */
export const getCSSVariable = (name: string): string => {
  if (typeof window === 'undefined') {return '';}
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

/**
 * Set CSS custom property value
 */
export const setCSSVariable = (name: string, value: string): void => {
  if (typeof window === 'undefined') {return;}
  document.documentElement.style.setProperty(name, value);
};

/**
 * Get theme color by name
 */
export const getThemeColor = (colorName: string): string => {
  return getCSSVariable(`--color-${colorName}`);
};

/**
 * Get theme spacing value
 */
export const getThemeSpacing = (size: string): string => {
  return getCSSVariable(`--spacing-${size}`);
};

/**
 * Get theme font size
 */
export const getThemeFontSize = (size: string): string => {
  return getCSSVariable(`--font-size-${size}`);
};

/**
 * Get theme border radius
 */
export const getThemeBorderRadius = (size: string): string => {
  return getCSSVariable(`--border-radius-${size}`);
};

/**
 * Get theme shadow
 */
export const getThemeShadow = (size: string): string => {
  return getCSSVariable(`--shadow-${size}`);
};

/**
 * Check if current theme is dark
 */
export const isDarkTheme = (): boolean => {
  if (typeof window === 'undefined') {return false;}
  return document.documentElement.classList.contains('theme-dark');
};

/**
 * Check if current theme is light
 */
export const isLightTheme = (): boolean => {
  if (typeof window === 'undefined') {return false;}
  return document.documentElement.classList.contains('theme-light');
};

/**
 * Get current resolved theme
 */
export const getCurrentTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {return 'light';}
  return isDarkTheme() ? 'dark' : 'light';
};

/**
 * Generate theme-aware styles object
 */
export const createThemeStyles = (styles: {
  light?: React.CSSProperties;
  dark?: React.CSSProperties;
  common?: React.CSSProperties;
}): React.CSSProperties => {
  const { light = {}, dark = {}, common = {} } = styles;
  const currentTheme = getCurrentTheme();

  return {
    ...common,
    ...(currentTheme === 'dark' ? dark : light),
  };
};

/**
 * Theme-aware class name generator
 */
export const createThemeClass = (
  baseClass: string,
  themeVariants?: {
    light?: string;
    dark?: string;
  }
): string => {
  const currentTheme = getCurrentTheme();
  const themeClass = themeVariants?.[currentTheme] || '';

  return `${baseClass} ${themeClass}`.trim();
};

/**
 * Get theme-aware value
 */
export const getThemeValue = <T>(lightValue: T, darkValue: T): T => {
  return isDarkTheme() ? darkValue : lightValue;
};

/**
 * Apply theme to element
 */
export const applyThemeToElement = (element: HTMLElement, theme: ResolvedTheme): void => {
  element.classList.remove('theme-light', 'theme-dark');
  element.classList.add(`theme-${theme}`);
};

/**
 * Detect system theme preference
 */
export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {return 'light';}

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (error) {
    return 'light';
  }
};

/**
 * Check if system supports dark mode
 */
export const supportsSystemTheme = (): boolean => {
  if (typeof window === 'undefined') {return false;}

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
  } catch (error) {
    return false;
  }
};

/**
 * Get stored theme preference
 */
export const getStoredTheme = (storageKey: string = 'theme'): Theme | null => {
  if (typeof window === 'undefined') {return null;}

  try {
    const stored = localStorage.getItem(storageKey) as Theme;
    const validThemes: Theme[] = ['light', 'dark', 'system'];
    return validThemes.includes(stored) ? stored : null;
  } catch (error) {
    return null;
  }
};

/**
 * Store theme preference
 */
export const storeTheme = (theme: Theme, storageKey: string = 'theme'): void => {
  if (typeof window === 'undefined') {return;}

  try {
    localStorage.setItem(storageKey, theme);
  } catch (error) {
    // Silently fail if localStorage is not available
  }
};

/**
 * Generate CSS variables for custom colors
 */
export const generateColorVariables = (colors: Record<string, string>): Record<string, string> => {
  const variables: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    variables[`--color-${key}`] = value;
  });

  return variables;
};

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Get contrast color (black or white) for given background
 */
export const getContrastColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) {return '#000000';}

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Create theme-aware CSS-in-JS object
 */
export const createThemeCSS = (definition: {
  light?: Record<string, any>;
  dark?: Record<string, any>;
  common?: Record<string, any>;
}) => {
  const { light = {}, dark = {}, common = {} } = definition;

  return {
    ...common,
    '.theme-light &': light,
    '.theme-dark &': dark,
  };
};

/**
 * Theme transition utilities
 */
export const createThemeTransition = (
  properties: string[] = ['background-color', 'color', 'border-color']
): string => {
  return properties.map(prop => `${prop} var(--transition-fast)`).join(', ');
};

export default {
  getCSSVariable,
  setCSSVariable,
  getThemeColor,
  getThemeSpacing,
  getThemeFontSize,
  getThemeBorderRadius,
  getThemeShadow,
  isDarkTheme,
  isLightTheme,
  getCurrentTheme,
  createThemeStyles,
  createThemeClass,
  getThemeValue,
  applyThemeToElement,
  getSystemTheme,
  supportsSystemTheme,
  getStoredTheme,
  storeTheme,
  generateColorVariables,
  hexToRgb,
  rgbToHex,
  getContrastColor,
  createThemeCSS,
  createThemeTransition,
};
