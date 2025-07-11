import React, { useState, useEffect } from 'react';
import { login, onUserChanged } from '../../../core/providers/auth.provider';
import '../../../App.css';
import { Link } from 'react-router-dom';

const Login: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onUserChanged(user => {
      if (user && loading) {
        console.log('User authenticated, calling onSuccess');
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
      console.log('Attempting login...');
      await login(email, password);
      console.log('Login successful');
      // Don't call onSuccess() immediately - let the auth state change handle the redirect
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <form className="login-container" onSubmit={handleSubmit}>
      <h2>Login</h2>
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
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
      <div className="login-links">
        <Link to="/signup">Sign Up</Link>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </form>
  );
};

export default Login;
