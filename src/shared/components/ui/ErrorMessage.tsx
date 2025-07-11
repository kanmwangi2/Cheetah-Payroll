/**
 * Reusable Error Message Component
 * Consistent error display with proper styling and accessibility
 */

import React from 'react';
import { Link } from 'react-router-dom';

export type ErrorType = 'credential' | 'network' | 'general' | 'validation';

interface ErrorMessageProps {
  error: string;
  type?: ErrorType;
  hint?: string;
  linkText?: string;
  linkTo?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  type = 'general',
  hint,
  linkText,
  linkTo,
  onRetry,
  className,
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return <NetworkErrorIcon />;
      case 'credential':
        return <CredentialErrorIcon />;
      case 'validation':
        return <ValidationErrorIcon />;
      default:
        return <AlertIcon />;
    }
  };

  const getDefaultHint = () => {
    if (hint) {return hint;}
    
    switch (type) {
      case 'network':
        return 'Check your internet connection and try again.';
      case 'credential':
        return 'Please check your information and try again.';
      case 'validation':
        return 'Please correct the highlighted fields.';
      default:
        return null;
    }
  };

  return (
    <div 
      className={className}
      style={getErrorStyles(type)} 
      role="alert" 
      aria-live="assertive"
    >
      {getErrorIcon()}
      <div style={errorContentStyles}>
        <span style={errorTextStyles}>{error}</span>
        {getDefaultHint() && (
          <small style={errorHintStyles}>
            {getDefaultHint()}
            {linkTo && linkText && (
              <>
                {' '}
                <Link to={linkTo} style={errorLinkStyles}>
                  {linkText}
                </Link>
              </>
            )}
            {onRetry && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={onRetry}
                  style={retryButtonStyles}
                >
                  Try again
                </button>
              </>
            )}
          </small>
        )}
      </div>
    </div>
  );
};

// Icons
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const NetworkErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3V7a1 1 0 0 1 1-1z"/>
    <path d="M13 8h7a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7"/>
    <path d="M8 21h8"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const CredentialErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ValidationErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// Styles
const getErrorStyles = (type: ErrorType): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-md)',
  backgroundColor: getBackgroundColor(type),
  color: getTextColor(type),
  borderRadius: 'var(--border-radius-md)',
  border: `1px solid ${getBorderColor(type)}`,
  fontSize: 'var(--font-size-sm)',
  marginBottom: 'var(--spacing-md)',
});

const getBackgroundColor = (type: ErrorType): string => {
  switch (type) {
    case 'network':
      return 'var(--color-warning-bg)';
    case 'validation':
      return 'var(--color-info-bg)';
    default:
      return 'var(--color-error-bg)';
  }
};

const getTextColor = (type: ErrorType): string => {
  switch (type) {
    case 'network':
      return 'var(--color-warning-text)';
    case 'validation':
      return 'var(--color-info-text)';
    default:
      return 'var(--color-error-text)';
  }
};

const getBorderColor = (type: ErrorType): string => {
  switch (type) {
    case 'network':
      return 'var(--color-warning-border)';
    case 'validation':
      return 'var(--color-info-border)';
    default:
      return 'var(--color-error-border)';
  }
};

const errorContentStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-xs)',
  flex: 1,
};

const errorTextStyles: React.CSSProperties = {
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.4,
};

const errorHintStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  opacity: 0.8,
  marginTop: 'var(--spacing-xs)',
  lineHeight: 1.4,
};

const errorLinkStyles: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'underline',
  fontWeight: 'var(--font-weight-medium)',
};

const retryButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  textDecoration: 'underline',
  fontWeight: 'var(--font-weight-medium)',
  cursor: 'pointer',
  fontSize: 'inherit',
  padding: 0,
};

export default ErrorMessage;