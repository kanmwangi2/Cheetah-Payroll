import React, { useState, useEffect } from 'react';
import { signUp, onUserChanged } from '../../../core/providers/auth.provider';
import '../../../App.css';
import { Link } from 'react-router-dom';

const SignUp: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onUserChanged(user => {
      if (user && loading) {
        console.log('User registered and authenticated, calling onSuccess');
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

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting signup...');
      await signUp(email, password, name.trim());
      console.log('Signup successful');
      // Don't call onSuccess() immediately - let the auth state change handle the redirect
    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.message || 'Sign up failed');
      setLoading(false);
    }
  };

  return (
    <form className="login-container" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <div className="password-input-container">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      <div className="password-input-container">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
        >
          {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      {error && <div className="error">{error}</div>}
      <div className="login-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </form>
  );
};

export default SignUp;
