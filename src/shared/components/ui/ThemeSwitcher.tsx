/**
 * Theme Switcher Component
 * Advanced theme switching component with icons and accessibility
 */

import React, { useState, useRef, useEffect } from 'react';
import { useThemeContext } from '../../../core/providers/ThemeProvider';
import { Theme } from '../../hooks/useTheme';

interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLabels?: boolean;
  className?: string;
}

// Icons for each theme (using simple SVG icons)
const ThemeIcons = {
  light: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  dark: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

const ThemeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'dropdown',
  size = 'md',
  position = 'top-right',
  showLabels = true,
  className = '',
}) => {
  const { theme, setTheme, toggleTheme, resolvedTheme, isSystemTheme } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div
        ref={dropdownRef}
        className={`relative ${className}`}
        style={{ position: 'fixed', zIndex: 'var(--z-dropdown)' }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center gap-2 rounded-lg border transition-colors
            ${sizeClasses[size]}
            bg-[var(--color-bg-primary)] 
            border-[var(--color-border-primary)]
            text-[var(--color-text-primary)]
            hover:bg-[var(--color-bg-secondary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2
            ${positionClasses[position]}
          `}
          aria-label="Toggle theme"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center">{ThemeIcons[theme]}</span>
          {showLabels && (
            <span className="hidden sm:inline">
              {ThemeLabels[theme]}
              {isSystemTheme && ` (${resolvedTheme})`}
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className={`
              absolute mt-1 w-48 rounded-lg shadow-lg border
              bg-[var(--color-bg-primary)]
              border-[var(--color-border-primary)]
              ${position.includes('right') ? 'right-0' : 'left-0'}
            `}
            style={{ boxShadow: 'var(--shadow-lg)' }}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="theme-menu"
          >
            <div className="py-1" role="none">
              {(['light', 'dark', 'system'] as Theme[]).map(themeOption => (
                <button
                  key={themeOption}
                  onClick={() => handleThemeChange(themeOption)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors
                    ${
                      theme === themeOption
                        ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                    }
                  `}
                  role="menuitem"
                  aria-current={theme === themeOption ? 'true' : 'false'}
                >
                  <span className="flex items-center">{ThemeIcons[themeOption]}</span>
                  <span className="flex-1">{ThemeLabels[themeOption]}</span>
                  {themeOption === 'system' && (
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      ({resolvedTheme})
                    </span>
                  )}
                  {theme === themeOption && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Toggle variant (cycles through themes)
  if (variant === 'toggle') {
    const toggleStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      padding: sizeClasses[size].includes('sm') ? 'var(--spacing-xs) var(--spacing-sm)' : 
               sizeClasses[size].includes('lg') ? 'var(--spacing-lg) var(--spacing-xl)' : 
               'var(--spacing-sm) var(--spacing-md)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--color-border-primary)',
      backgroundColor: 'var(--color-bg-primary)',
      color: 'var(--color-text-primary)',
      fontSize: sizeClasses[size].includes('sm') ? 'var(--font-size-sm)' : 
               sizeClasses[size].includes('lg') ? 'var(--font-size-lg)' : 
               'var(--font-size-base)',
      fontWeight: 'var(--font-weight-medium)',
      cursor: 'pointer',
      transition: 'all var(--transition-normal)',
      boxShadow: 'var(--shadow-sm)',
      zIndex: 1000,
    };

    return (
      <button
        onClick={toggleTheme}
        style={toggleStyles}
        className={className}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--color-primary-500)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        aria-label={`Switch to next theme (current: ${theme})`}
        title={`Current theme: ${ThemeLabels[theme]}${isSystemTheme ? ` (${resolvedTheme})` : ''}`}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>{ThemeIcons[theme]}</span>
        {showLabels && (
          <span style={{ display: window.innerWidth >= 640 ? 'inline' : 'none' }}>
            {ThemeLabels[theme]}
          </span>
        )}
      </button>
    );
  }

  // Segmented variant
  if (variant === 'segmented') {
    return (
      <div
        className={`
          inline-flex rounded-lg border bg-[var(--color-bg-secondary)] p-1
          border-[var(--color-border-primary)]
          ${className}
        `}
        role="radiogroup"
        aria-label="Theme selection"
      >
        {(['light', 'dark', 'system'] as Theme[]).map(themeOption => (
          <button
            key={themeOption}
            onClick={() => handleThemeChange(themeOption)}
            className={`
              inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-all
              ${
                theme === themeOption
                  ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }
            `}
            role="radio"
            aria-checked={theme === themeOption}
            aria-label={`${ThemeLabels[themeOption]} theme`}
          >
            <span className="flex items-center">{ThemeIcons[themeOption]}</span>
            {showLabels && <span className="hidden sm:inline">{ThemeLabels[themeOption]}</span>}
          </button>
        ))}
      </div>
    );
  }

  return null;
};

export default ThemeSwitcher;
