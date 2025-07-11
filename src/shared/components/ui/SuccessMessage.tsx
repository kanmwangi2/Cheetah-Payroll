/**
 * Reusable Success Message Component
 * Consistent success display with proper styling and accessibility
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface SuccessMessageProps {
  message: string;
  hint?: string;
  linkText?: string;
  linkTo?: string;
  onAction?: () => void;
  actionText?: string;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  hint,
  linkText,
  linkTo,
  onAction,
  actionText,
  className,
  dismissible = false,
  onDismiss,
}) => {
  return (
    <div 
      className={className}
      style={successStyles} 
      role="alert" 
      aria-live="polite"
    >
      <CheckIcon />
      <div style={messageContentStyles}>
        <span style={messageTextStyles}>{message}</span>
        {hint && (
          <small style={messageHintStyles}>
            {hint}
            {linkTo && linkText && (
              <>
                {' '}
                <Link to={linkTo} style={messageLinkStyles}>
                  {linkText}
                </Link>
              </>
            )}
            {onAction && actionText && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={onAction}
                  style={actionButtonStyles}
                >
                  {actionText}
                </button>
              </>
            )}
          </small>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={dismissButtonStyles}
          aria-label="Dismiss message"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

// Icons
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Styles
const successStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-md)',
  backgroundColor: 'var(--color-success-bg)',
  color: 'var(--color-success-text)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-success-border)',
  fontSize: 'var(--font-size-sm)',
  marginBottom: 'var(--spacing-md)',
};

const messageContentStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-xs)',
  flex: 1,
};

const messageTextStyles: React.CSSProperties = {
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.4,
};

const messageHintStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  opacity: 0.8,
  marginTop: 'var(--spacing-xs)',
  lineHeight: 1.4,
};

const messageLinkStyles: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'underline',
  fontWeight: 'var(--font-weight-medium)',
};

const actionButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  textDecoration: 'underline',
  fontWeight: 'var(--font-weight-medium)',
  cursor: 'pointer',
  fontSize: 'inherit',
  padding: 0,
};

const dismissButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  padding: 'var(--spacing-xs)',
  borderRadius: 'var(--border-radius-sm)',
  opacity: 0.6,
  transition: 'opacity var(--transition-normal)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default SuccessMessage;