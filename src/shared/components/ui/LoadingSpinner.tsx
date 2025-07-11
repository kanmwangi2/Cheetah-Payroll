/**
 * Loading Spinner Component
 * Reusable loading indicator with customizable size and message
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  center?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  center = true,
}) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px',
  };

  const spinnerStyle: React.CSSProperties = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: center ? '0 auto' : '0',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: center ? 'center' : 'flex-start',
    padding: '20px',
    minHeight: center ? '200px' : 'auto',
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {message && (
        <p
          style={{
            marginTop: '10px',
            color: '#666',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
