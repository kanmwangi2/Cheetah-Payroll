/**
 * Logo Component
 * Beautiful, scalable logo for Cheetah Payroll with customizable size and style
 */

import React, { memo } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = memo(({
  size = 'medium',
  variant = 'full',
  className = '',
  onClick
}) => {
  const sizeMap = {
    small: { iconSize: 24, fontSize: '16px', spacing: '8px' },
    medium: { iconSize: 32, fontSize: '20px', spacing: '12px' },
    large: { iconSize: 40, fontSize: '24px', spacing: '16px' },
    xl: { iconSize: 48, fontSize: '28px', spacing: '20px' },
  };

  const { iconSize, fontSize, spacing } = sizeMap[size];

  const IconLogo = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="cheetahGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      
      {/* Main circle background */}
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="url(#logoGradient)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      
      {/* Cheetah spots pattern */}
      <circle cx="18" cy="16" r="2" fill="url(#cheetahGradient)" opacity="0.8" />
      <circle cx="30" cy="18" r="1.5" fill="url(#cheetahGradient)" opacity="0.8" />
      <circle cx="20" cy="28" r="1.5" fill="url(#cheetahGradient)" opacity="0.8" />
      <circle cx="32" cy="30" r="2" fill="url(#cheetahGradient)" opacity="0.8" />
      
      {/* Stylized 'C' for Cheetah */}
      <path
        d="M24 12C30.627 12 36 17.373 36 24C36 30.627 30.627 36 24 36C17.373 36 12 30.627 12 24"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Central 'P' for Payroll */}
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        P
      </text>
    </svg>
  );

  const logoContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
  };

  const textStyle = {
    fontSize,
    fontWeight: '700',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    letterSpacing: '-0.02em',
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'icon':
        return <IconLogo />;
      case 'text':
        return <span style={textStyle}>Cheetah Payroll</span>;
      case 'full':
      default:
        return (
          <>
            <IconLogo />
            <span style={textStyle}>Cheetah Payroll</span>
          </>
        );
    }
  };

  return (
    <div
      className={className}
      style={logoContainer}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }
      }}
    >
      {renderContent()}
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;