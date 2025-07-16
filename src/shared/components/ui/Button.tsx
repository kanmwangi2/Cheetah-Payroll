/**
 * Theme-aware Button Component
 * A comprehensive button component that uses standardized CSS classes
 */

import React, { ReactNode, forwardRef, ButtonHTMLAttributes } from 'react';

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
    // Generate CSS classes using standardized button classes
    const getButtonClass = () => {
      const classes = ['btn'];
      
      // Map variants to CSS classes
      const variantMap = {
        primary: 'btn-primary',
        secondary: 'btn-secondary', 
        outline: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        success: 'btn-success',
        warning: 'btn-warning'
      };
      
      classes.push(variantMap[variant]);
      classes.push(`btn-${size}`);
      
      if (className) {
        classes.push(className);
      }
      
      return classes.join(' ');
    };

    // Additional inline styles for fullWidth and custom overrides
    const additionalStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
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
          className={getButtonClass()}
          style={additionalStyles}
          disabled={disabled || loading}
          {...props}
        >
          {loading && <LoadingSpinner />}
          {!loading && leftIcon && (
            <span
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {leftIcon}
            </span>
          )}

          <span style={{ display: loading ? 'none' : 'block' }}>
            {children}
          </span>

          {!loading && rightIcon && (
            <span
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