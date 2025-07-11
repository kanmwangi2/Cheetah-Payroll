/**
 * Professional ForgotPassword Component
 * Modern, accessible forgot password page with theme support and enhanced UX
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../../core/providers/auth.provider';
import { useThemeContext } from '../../../core/providers/ThemeProvider';
import ThemeSwitcher from '../../../shared/components/ui/ThemeSwitcher';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import ThemeBoundary from '../../../shared/components/ui/ThemeBoundary';
import { logger } from '../../../shared/utils/logger';
import { getFirebaseErrorMessage, isCredentialError, isRetryableError } from '../../../shared/utils/firebase-errors';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'credential' | 'network' | 'general'>('general');
  const [loading, setLoading] = useState(false);

  const { isDark, resolvedTheme } = useThemeContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      logger.info('Attempting password reset');
      await resetPassword(email);
      setMessage('Password reset email sent successfully! Please check your inbox and follow the instructions to reset your password.');
      logger.info('Password reset email sent successfully');
    } catch (err: any) {
      logger.error('Password reset failed', err);
      const userFriendlyMessage = getFirebaseErrorMessage(err);
      setError(userFriendlyMessage);
      
      // Set error type for appropriate styling/messaging
      if (isCredentialError(err)) {
        setErrorType('credential');
      } else if (isRetryableError(err)) {
        setErrorType('network');
      } else {
        setErrorType('general');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <LoadingSpinner message="Sending reset email..." size="large" />
      </div>
    );
  }

  return (
    <ThemeBoundary>
      <div style={containerStyles}>
      {/* Theme Switcher */}
      <div style={themeSwitcherStyles}>
        <ThemeSwitcher variant="toggle" size="sm" showLabels={true} />
      </div>

      {/* Forgot Password Card */}
      <div style={cardStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <div style={logoStyles}>
            🐆
          </div>
          <h1 style={titleStyles}>
            Reset Your Password
          </h1>
          <p style={subtitleStyles}>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} style={formStyles}>
          {/* Email Field */}
          <div style={fieldGroupStyles}>
            <label htmlFor="email" style={labelStyles}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={inputStyles}
              aria-describedby={error ? 'error-message' : message ? 'success-message' : undefined}
            />
          </div>

          {/* Success Message */}
          {message && (
            <div id="success-message" style={successStyles} role="alert" aria-live="polite">
              <CheckIcon />
              <div style={messageContentStyles}>
                <span>{message}</span>
                <small style={messageHintStyles}>
                  Didn't receive an email? Check your spam folder or try again.
                </small>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div id="error-message" style={getErrorStyles(errorType)} role="alert" aria-live="assertive">
              <AlertIcon />
              <div style={errorContentStyles}>
                <span>{error}</span>
                {errorType === 'network' && (
                  <small style={errorHintStyles}>
                    Check your internet connection and try again.
                  </small>
                )}
                {errorType === 'credential' && (
                  <small style={errorHintStyles}>
                    Make sure you've entered a valid email address.
                  </small>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={submitButtonStyles}
          >
            {loading ? 'Sending Email...' : 'Send Reset Email'}
          </button>
        </form>

        {/* Footer Links */}
        <div style={footerStyles}>
          <div style={linkContainerStyles}>
            <Link to="/login" style={linkStyles}>
              ← Back to Sign In
            </Link>
            <span style={separatorStyles}>•</span>
            <Link to="/signup" style={linkStyles}>
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={pageFooterStyles}>
        <p style={copyrightStyles}>
          © 2025 Cheetah Payroll. Built for Rwanda's workforce.
        </p>
      </div>
      </div>
    </ThemeBoundary>
  );
};

// SVG Icons
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Styles
const containerStyles: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg-primary)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--spacing-lg)',
  position: 'relative',
  transition: 'background-color var(--transition-normal)',
};

const themeSwitcherStyles: React.CSSProperties = {
  position: 'fixed',
  top: '24px',
  right: '24px',
  zIndex: 1000,
  backgroundColor: 'var(--color-bg-secondary)',
  padding: '12px',
  borderRadius: '12px',
  border: '2px solid var(--color-border-primary)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
  backdropFilter: 'blur(8px)',
  minWidth: '120px',
  transition: 'all var(--transition-normal)',
};

const cardStyles: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-secondary)',
  borderRadius: 'var(--border-radius-xl)',
  padding: 'var(--spacing-4xl)',
  boxShadow: 'var(--shadow-xl)',
  border: '1px solid var(--color-border-primary)',
  width: '100%',
  maxWidth: '420px',
  transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
};

const headerStyles: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: 'var(--spacing-4xl)',
};

const logoStyles: React.CSSProperties = {
  fontSize: '3rem',
  marginBottom: 'var(--spacing-lg)',
};

const titleStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-3xl)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--spacing-sm) 0',
  transition: 'color var(--transition-normal)',
};

const subtitleStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-base)',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: 1.5,
  transition: 'color var(--transition-normal)',
};

const formStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-xl)',
};

const fieldGroupStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
};

const labelStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-primary)',
  transition: 'color var(--transition-normal)',
};

const inputStyles: React.CSSProperties = {
  padding: 'var(--spacing-md) var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-border-secondary)',
  backgroundColor: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-base)',
  transition: 'all var(--transition-normal)',
};

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
};

const getErrorStyles = (errorType: 'credential' | 'network' | 'general'): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-md)',
  backgroundColor: errorType === 'network' ? 'var(--color-warning-bg)' : 'var(--color-error-bg)',
  color: errorType === 'network' ? 'var(--color-warning-text)' : 'var(--color-error-text)',
  borderRadius: 'var(--border-radius-md)',
  border: `1px solid ${errorType === 'network' ? 'var(--color-warning-border)' : 'var(--color-error-border)'}`,
  fontSize: 'var(--font-size-sm)',
});

const messageContentStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-xs)',
  flex: 1,
};

const errorContentStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-xs)',
  flex: 1,
};

const messageHintStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  opacity: 0.8,
  marginTop: 'var(--spacing-xs)',
  lineHeight: 1.4,
};

const errorHintStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  opacity: 0.8,
  marginTop: 'var(--spacing-xs)',
  lineHeight: 1.4,
};

const submitButtonStyles: React.CSSProperties = {
  padding: 'var(--spacing-md) var(--spacing-lg)',
  backgroundColor: 'var(--color-primary-500)',
  color: 'var(--color-text-inverse)',
  border: 'none',
  borderRadius: 'var(--border-radius-md)',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-medium)',
  cursor: 'pointer',
  transition: 'all var(--transition-normal)',
  marginTop: 'var(--spacing-sm)',
};

const footerStyles: React.CSSProperties = {
  marginTop: 'var(--spacing-4xl)',
  textAlign: 'center',
};

const linkContainerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
  fontSize: 'var(--font-size-sm)',
};

const linkStyles: React.CSSProperties = {
  color: 'var(--color-primary-600)',
  textDecoration: 'none',
  fontWeight: 'var(--font-weight-medium)',
  transition: 'color var(--transition-normal)',
};

const separatorStyles: React.CSSProperties = {
  color: 'var(--color-text-tertiary)',
  fontSize: 'var(--font-size-xs)',
};

const pageFooterStyles: React.CSSProperties = {
  marginTop: 'var(--spacing-4xl)',
  textAlign: 'center',
};

const copyrightStyles: React.CSSProperties = {
  color: 'var(--color-text-tertiary)',
  fontSize: 'var(--font-size-xs)',
  margin: 0,
  transition: 'color var(--transition-normal)',
};

export default ForgotPassword;