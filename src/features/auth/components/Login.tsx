/**
 * Professional Login Component
 * Modern, accessible login page with theme support and enhanced UX
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { signInUser, onUserChanged } from '../../../core/providers/auth.provider';
import { db } from '../../../core/config/firebase.config';
import { useThemeContext } from '../../../core/providers/ThemeProvider';
import ThemeSwitcher from '../../../shared/components/ui/ThemeSwitcher';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import ThemeBoundary from '../../../shared/components/ui/ThemeBoundary';
import Button from '../../../shared/components/ui/Button';
import Logo from '../../../shared/components/ui/Logo';
import { logger } from '../../../shared/utils/logger';
import { getFirebaseErrorMessage, isCredentialError, isRetryableError } from '../../../shared/utils/firebase-errors';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'credential' | 'network' | 'general'>('general');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [globalLogoUrl, setGlobalLogoUrl] = useState<string>('');

  useThemeContext(); // Theme context used by parent components

  // Load global logo settings
  useEffect(() => {
    const loadGlobalLogo = async () => {
      try {
        const docRef = doc(db, 'app_settings', 'global_settings');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.application?.logoUrl) {
            setGlobalLogoUrl(data.application.logoUrl);
          }
        }
      } catch (error) {
        console.error('Error loading global logo:', error);
      }
    };

    loadGlobalLogo();
  }, []);

  useEffect(() => {
    const unsubscribe = onUserChanged(user => {
      if (user && loading) {
        logger.info('User authenticated successfully, redirecting...');
        setLoading(false);
        onSuccess();
      }
    });
    return () => unsubscribe();
  }, [loading, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      logger.info('Attempting user authentication');
      await signInUser(email, password);
      logger.info('Login successful');
      // Auth state change will handle the redirect
    } catch (err: unknown) {
      logger.error('Login failed', err as Error);
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
      
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <LoadingSpinner message="Signing you in..." size="large" />
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

      {/* Login Card */}
      <div style={cardStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <div style={logoStyles}>
            {globalLogoUrl ? (
              <img 
                src={globalLogoUrl} 
                alt="Company Logo" 
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Logo size="xl" variant="icon" />
            )}
          </div>
          <h1 style={titleStyles}>
            Welcome to Cheetah Payroll
          </h1>
          <p style={subtitleStyles}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
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
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>

          {/* Password Field */}
          <div style={fieldGroupStyles}>
            <label htmlFor="password" style={labelStyles}>
              Password
            </label>
            <div style={passwordContainerStyles}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={passwordInputStyles}
                aria-describedby={error ? 'error-message' : undefined}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="btn btn-ghost btn-sm"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '4px 8px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOffIcon />
                ) : (
                  <EyeIcon />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={checkboxGroupStyles}>
            <label style={checkboxLabelStyles}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={checkboxStyles}
              />
              <span style={checkboxTextStyles}>Remember me</span>
            </label>
          </div>

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
                    Double-check your email and password, or <Link to="/forgot-password" style={errorLinkStyles}>reset your password</Link>.
                  </small>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        {/* Footer Links */}
        <div style={footerStyles}>
          <Link to="/forgot-password" style={linkStyles}>
            Forgot your password?
          </Link>
          <div style={signupPromptStyles}>
            <span style={signupTextStyles}>Don't have an account?</span>
            <Link to="/signup" style={signupLinkStyles}>
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={pageFooterStyles}>
        <p style={copyrightStyles}>
          © 2025 Cheetah Payroll
        </p>
      </div>
      </div>
    </ThemeBoundary>
  );
};

// SVG Icons
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
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
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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

const passwordContainerStyles: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const passwordInputStyles: React.CSSProperties = {
  ...inputStyles,
  paddingRight: 'var(--spacing-5xl)',
  width: '100%',
};


const checkboxGroupStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const checkboxLabelStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  cursor: 'pointer',
  fontSize: 'var(--font-size-sm)',
};

const checkboxStyles: React.CSSProperties = {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
};

const checkboxTextStyles: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  transition: 'color var(--transition-normal)',
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

const errorContentStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-xs)',
  flex: 1,
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


const footerStyles: React.CSSProperties = {
  marginTop: 'var(--spacing-4xl)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-lg)',
};

const linkStyles: React.CSSProperties = {
  color: 'var(--color-primary-600)',
  textDecoration: 'none',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  transition: 'color var(--transition-normal)',
};

const signupPromptStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 'var(--spacing-xs)',
  fontSize: 'var(--font-size-sm)',
};

const signupTextStyles: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  transition: 'color var(--transition-normal)',
};

const signupLinkStyles: React.CSSProperties = {
  color: 'var(--color-primary-600)',
  textDecoration: 'none',
  fontWeight: 'var(--font-weight-medium)',
  transition: 'color var(--transition-normal)',
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

export default Login;