/**
 * Professional SignUp Component
 * Modern, accessible signup page with theme support and enhanced UX
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { signUpUser, onUserChanged } from '../../../core/providers/auth.provider';
import { db } from '../../../core/config/firebase.config';
import { useThemeContext } from '../../../core/providers/ThemeProvider';
import ThemeSwitcher from '../../../shared/components/ui/ThemeSwitcher';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import Logo from '../../../shared/components/ui/Logo';
import ThemeBoundary from '../../../shared/components/ui/ThemeBoundary';
import Button from '../../../shared/components/ui/Button';
import { logger } from '../../../shared/utils/logger';
import { getFirebaseErrorMessage, isCredentialError, isRetryableError } from '../../../shared/utils/firebase-errors';

interface SignUpProps {
  onSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'credential' | 'network' | 'general'>('general');
  const [loading, setLoading] = useState(false);
  const [globalLogoUrl, setGlobalLogoUrl] = useState<string>('');

  const { } = useThemeContext(); // Theme context used by parent components

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
        logger.info('User registered and authenticated, redirecting...');
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

    // Client-side validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      setErrorType('general');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      setErrorType('general');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setErrorType('general');
      setLoading(false);
      return;
    }

    try {
      logger.info('Attempting user registration');
      await signUpUser(email, password, name.trim());
      logger.info('Registration successful');
      // Auth state change will handle the redirect
    } catch (err: any) {
      logger.error('Registration failed', err);
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <LoadingSpinner message="Creating your account..." size="large" />
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

      {/* SignUp Card */}
      <div style={cardStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <div style={logoStyles}>
            {globalLogoUrl ? (
              <img 
                src={globalLogoUrl} 
                alt="Company Logo" 
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Logo size="large" variant="icon" />
            )}
          </div>
          <h1 style={titleStyles}>
            Join Cheetah Payroll
          </h1>
          <p style={subtitleStyles}>
            Create your account to get started
          </p>
        </div>

        {/* SignUp Form */}
        <form onSubmit={handleSubmit} style={formStyles}>
          {/* Name Field */}
          <div style={fieldGroupStyles}>
            <label htmlFor="name" style={labelStyles}>
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              style={inputStyles}
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>

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
                placeholder="Create a strong password"
                required
                style={passwordInputStyles}
                aria-describedby={error ? 'error-message' : undefined}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={passwordToggleStyles}
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

          {/* Confirm Password Field */}
          <div style={fieldGroupStyles}>
            <label htmlFor="confirmPassword" style={labelStyles}>
              Confirm Password
            </label>
            <div style={passwordContainerStyles}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                style={passwordInputStyles}
                aria-describedby={error ? 'error-message' : undefined}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                style={passwordToggleStyles}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon />
                ) : (
                  <EyeIcon />
                )}
              </button>
            </div>
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
                    Please check your information and try again.
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
            Create Account
          </Button>
        </form>

        {/* Footer Links */}
        <div style={footerStyles}>
          <div style={signupPromptStyles}>
            <span style={signupTextStyles}>Already have an account?</span>
            <Link to="/login" style={signupLinkStyles}>
              Sign in
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
  width: '100%',
  maxWidth: '420px',
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

const passwordToggleStyles: React.CSSProperties = {
  position: 'absolute',
  right: 'var(--spacing-md)',
  background: 'none',
  border: 'none',
  color: 'var(--color-text-tertiary)',
  cursor: 'pointer',
  padding: 'var(--spacing-xs)',
  borderRadius: 'var(--border-radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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


const footerStyles: React.CSSProperties = {
  marginTop: 'var(--spacing-4xl)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-lg)',
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

export default SignUp;