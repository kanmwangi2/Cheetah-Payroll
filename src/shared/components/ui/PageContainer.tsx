/**
 * Reusable Page Container Component
 * Consistent page layout with header, content, and theme integration
 */

import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
  headerActions?: React.ReactNode;
  fullWidth?: boolean;
  centered?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  children,
  className,
  showThemeToggle = true,
  headerActions,
  fullWidth = false,
  centered = false,
}) => {
  return (
    <div style={getContainerStyles(fullWidth, centered)} className={className}>
      {/* Theme Switcher */}
      {showThemeToggle && (
        <div style={themeSwitcherStyles}>
          <ThemeSwitcher variant="toggle" size="sm" showLabels={false} />
        </div>
      )}

      {/* Page Header */}
      {(title || headerActions) && (
        <div style={headerContainerStyles}>
          {title && (
            <div style={headerTextStyles}>
              <h1 style={titleStyles}>{title}</h1>
              {subtitle && (
                <p style={subtitleStyles}>{subtitle}</p>
              )}
            </div>
          )}
          {headerActions && (
            <div style={headerActionsStyles}>
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main style={contentStyles}>
        {children}
      </main>
    </div>
  );
};

// Styles
const getContainerStyles = (fullWidth: boolean, centered: boolean): React.CSSProperties => ({
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  transition: 'background-color var(--transition-normal), color var(--transition-normal)',
  position: 'relative',
  padding: fullWidth ? 0 : 'var(--spacing-lg)',
  display: centered ? 'flex' : 'block',
  flexDirection: centered ? 'column' : undefined,
  alignItems: centered ? 'center' : undefined,
  justifyContent: centered ? 'center' : undefined,
});

const themeSwitcherStyles: React.CSSProperties = {
  position: 'fixed',
  top: 'var(--spacing-lg)',
  right: 'var(--spacing-lg)',
  zIndex: 50,
  backgroundColor: 'var(--color-bg-secondary)',
  padding: 'var(--spacing-xs)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-border-primary)',
  boxShadow: 'var(--shadow-sm)',
};

const headerContainerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 'var(--spacing-4xl)',
  paddingTop: 'var(--spacing-xl)',
  gap: 'var(--spacing-lg)',
};

const headerTextStyles: React.CSSProperties = {
  flex: 1,
};

const titleStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-4xl)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--spacing-sm) 0',
  lineHeight: 1.2,
};

const subtitleStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-lg)',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: 1.4,
};

const headerActionsStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
  flexShrink: 0,
};

const contentStyles: React.CSSProperties = {
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
};

export default PageContainer;