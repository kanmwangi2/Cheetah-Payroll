/**
 * Theme-aware Card Component
 * A flexible card component that adapts to the current theme
 */

import React, { ReactNode, forwardRef } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      size = 'md',
      clickable = false,
      disabled = false,
      onClick,
      style,
      'aria-label': ariaLabel,
      role,
      ...props
    },
    ref
  ) => {
    // const { isDark } = useThemeValues(); // Unused for now

    const sizeStyles = {
      sm: {
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--border-radius-md)',
      },
      md: {
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--border-radius-lg)',
      },
      lg: {
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--border-radius-xl)',
      },
    };

    const variantStyles = {
      default: {
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-card-border)',
        boxShadow: 'var(--shadow-sm)',
      },
      outlined: {
        backgroundColor: 'transparent',
        border: '2px solid var(--color-card-border)',
        boxShadow: 'none',
      },
      elevated: {
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-card-border)',
        boxShadow: 'var(--shadow-lg)',
      },
      filled: {
        backgroundColor: 'var(--color-bg-secondary)',
        border: 'none',
        boxShadow: 'var(--shadow-sm)',
      },
    };

    const baseStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all var(--transition-fast)',
      ...sizeStyles[size],
      ...variantStyles[variant],
    };

    const interactiveStyles: React.CSSProperties =
      clickable && !disabled
        ? {
            cursor: 'pointer',
            transform: 'translateY(0)',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          }
        : {};

    const disabledStyles: React.CSSProperties = disabled
      ? {
          opacity: 0.6,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        }
      : {};

    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...interactiveStyles,
      ...disabledStyles,
      ...style,
    };

    const handleClick = () => {
      if (clickable && !disabled && onClick) {
        onClick();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (clickable && !disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        className={`card ${className}`}
        style={combinedStyles}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={clickable && !disabled ? 0 : undefined}
        role={role || (clickable ? 'button' : undefined)}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Sub-components for better composition
export const CardHeader: React.FC<{
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style }) => (
  <div
    className={`card-header ${className}`}
    style={{
      marginBottom: 'var(--spacing-md)',
      paddingBottom: 'var(--spacing-md)',
      borderBottom: '1px solid var(--color-border-primary)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}> = ({ children, className = '', style, level = 3 }) => {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Tag
      className={`card-title ${className}`}
      style={{
        margin: 0,
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--line-height-tight)',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

export const CardContent: React.FC<{
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style }) => (
  <div
    className={`card-content ${className}`}
    style={{
      flex: 1,
      color: 'var(--color-text-secondary)',
      lineHeight: 'var(--line-height-relaxed)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardFooter: React.FC<{
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style }) => (
  <div
    className={`card-footer ${className}`}
    style={{
      marginTop: 'var(--spacing-md)',
      paddingTop: 'var(--spacing-md)',
      borderTop: '1px solid var(--color-border-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 'var(--spacing-sm)',
      ...style,
    }}
  >
    {children}
  </div>
);

export default Card;
