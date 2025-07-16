/**
 * Theme-aware Button Component
 * A comprehensive button component that adapts to the current theme
 */

import React, { ReactNode, forwardRef, ButtonHTMLAttributes } from 'react';
import { useThemeValues } from '../../../core/providers/ThemeProvider';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const { isDark, themeValue } = useThemeValues();
    void isDark;
    void themeValue;

    const sizeStyles = {
      xs: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        fontSize: 'var(--font-size-xs)',
        borderRadius: 'var(--border-radius-sm)',
        height: '24px',
        minWidth: '48px',
      },
      sm: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontSize: 'var(--font-size-sm)',
        borderRadius: 'var(--border-radius-md)',
        height: '32px',
        minWidth: '64px',
      },
      md: {
        padding: 'var(--spacing-md) var(--spacing-lg)',
        fontSize: 'var(--font-size-base)',
        borderRadius: 'var(--border-radius-md)',
        height: '40px',
        minWidth: '80px',
      },
      lg: {
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        fontSize: 'var(--font-size-lg)',
        borderRadius: 'var(--border-radius-lg)',
        height: '48px',
        minWidth: '96px',
      },
      xl: {
        padding: 'var(--spacing-xl) var(--spacing-2xl)',
        fontSize: 'var(--font-size-xl)',
        borderRadius: 'var(--border-radius-lg)',
        height: '56px',
        minWidth: '112px',
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: 'var(--color-button-primary)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-button-primary)',
        boxShadow: 'var(--shadow-sm)',
        ':hover': {
          backgroundColor: 'var(--color-button-primary-hover)',
          borderColor: 'var(--color-button-primary-hover)',
          boxShadow: 'var(--shadow-md)',
        },
        ':active': {
          transform: 'translateY(1px)',
          boxShadow: 'var(--shadow-sm)',
        },
      },
      secondary: {
        backgroundColor: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-primary)',
        boxShadow: 'var(--shadow-sm)',
        ':hover': {
          backgroundColor: 'var(--color-bg-tertiary)',
          borderColor: 'var(--color-border-secondary)',
          boxShadow: 'var(--shadow-md)',
        },
        ':active': {
          transform: 'translateY(1px)',
          boxShadow: 'var(--shadow-sm)',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--color-button-primary)',
        border: '2px solid var(--color-button-primary)',
        boxShadow: 'none',
        ':hover': {
          backgroundColor: 'var(--color-button-primary)',
          color: 'var(--color-text-inverse)',
          borderColor: 'var(--color-button-primary)',
        },
        ':active': {
          transform: 'translateY(1px)',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-text-primary)',
        border: 'none',
        boxShadow: 'none',
        ':hover': {
          backgroundColor: 'var(--color-bg-secondary)',
        },
        ':active': {
          backgroundColor: 'var(--color-bg-tertiary)',
        },
      },
      danger: {
        backgroundColor: 'var(--color-error-500)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-error-500)',
        boxShadow: 'var(--shadow-sm)',
        ':hover': {
          backgroundColor: 'var(--color-error-600)',
          borderColor: 'var(--color-error-600)',
          boxShadow: 'var(--shadow-md)',
        },
        ':active': {
          transform: 'translateY(1px)',
          boxShadow: 'var(--shadow-sm)',
        },
      },
      success: {
        backgroundColor: 'var(--color-success-500)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-success-500)',
        boxShadow: 'var(--shadow-sm)',
        ':hover': {
          backgroundColor: 'var(--color-success-600)',
          borderColor: 'var(--color-success-600)',
          boxShadow: 'var(--shadow-md)',
        },
        ':active': {
          transform: 'translateY(1px)',
          boxShadow: 'var(--shadow-sm)',
        },
      },
      warning: {
        backgroundColor: 'var(--color-warning-500)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-warning-500)',
        boxShadow: 'var(--shadow-sm)',
        ':hover': {
          backgroundColor: 'var(--color-warning-600)',
          borderColor: 'var(--color-warning-600)',
          boxShadow: 'var(--shadow-md)',
        },
        ':active': {
          transform: 'translateY(1px)',
          boxShadow: 'var(--shadow-sm)',
        },
      },
    };

    const baseStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--spacing-sm)',
      fontFamily: 'var(--font-family-primary)',
      fontWeight: 'var(--font-weight-medium)',
      textAlign: 'center',
      textDecoration: 'none',
      cursor: 'pointer',
      outline: 'none',
      transition: 'all var(--transition-fast)',
      userSelect: 'none',
      width: fullWidth ? '100%' : 'auto',
      ...sizeStyles[size],
      ...variantStyles[variant],
    };

    const disabledStyles: React.CSSProperties =
      disabled || loading
        ? {
            opacity: 0.6,
            cursor: 'not-allowed',
            pointerEvents: 'none',
          }
        : {};

    const focusStyles: React.CSSProperties = {
      outline: '2px solid var(--color-border-focus)',
      outlineOffset: '2px',
    };

    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...disabledStyles,
      ...focusStyles,
      ...style,
    };

    const LoadingSpinner = () => (
      <div
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    );

    return (
      <>
        <button
          ref={ref}
          className={`button button-${variant} button-${size} ${className}`}
          style={combinedStyles}
          disabled={disabled || loading}
          {...props}
        >
          {loading && <LoadingSpinner />}
          {!loading && leftIcon && (
            <span
              className="button-icon button-icon-left"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {leftIcon}
            </span>
          )}

          <span className="button-text" style={{ display: loading ? 'none' : 'block' }}>
            {children}
          </span>

          {!loading && rightIcon && (
            <span
              className="button-icon button-icon-right"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {rightIcon}
            </span>
          )}
        </button>

        {/* Add keyframe animation for loading spinner */}
        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </>
    );
  }
);

Button.displayName = 'Button';

export default Button;
