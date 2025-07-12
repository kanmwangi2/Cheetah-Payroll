import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../core/providers/ThemeProvider';
import ThemeSwitcher from '../../../shared/components/ui/ThemeSwitcher';
import ThemeBoundary from '../../../shared/components/ui/ThemeBoundary';
import CompanyManagement from './CompanyManagement';
import UserManagement from './UserManagement';
import TaxConfiguration from './TaxConfiguration';
import GlobalSettings from './GlobalSettings';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('companies');
  const navigate = useNavigate();
  const { isDark, resolvedTheme } = useThemeContext();

  const tabs = [
    { id: 'companies', label: 'Company Management', icon: '🏢' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'tax', label: 'Tax Configuration', icon: '📊' },
    { id: 'settings', label: 'Global Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'companies':
        return <CompanyManagement />;
      case 'users':
        return <UserManagement />;
      case 'tax':
        return <TaxConfiguration />;
      case 'settings':
        return <GlobalSettings />;
      default:
        return <CompanyManagement />;
    }
  };

  return (
    <ThemeBoundary>
      <div style={containerStyles}>
        {/* Theme Switcher */}
        <div style={themeSwitcherStyles}>
          <ThemeSwitcher variant="toggle" size="sm" showLabels={true} />
        </div>

        {/* Header */}
        <div style={headerStyles}>
          <div style={headerContentStyles}>
            <div style={titleSectionStyles}>
              <div style={logoStyles}>🐆</div>
              <h1 style={titleStyles}>
                Application Administration
              </h1>
            </div>
            <button
              onClick={() => navigate('/company-select')}
              style={backButtonStyles}
            >
              ← Back to Company Selection
            </button>
          </div>
          
          <div style={tabsContainerStyles}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={getTabStyles(activeTab === tab.id)}
              >
                <span style={tabIconStyles}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={contentWrapperStyles}>
          <div style={contentStyles}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </ThemeBoundary>
  );
};

// Theme-aware styles
const containerStyles: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg-primary)',
  transition: 'background-color var(--transition-normal)',
};

const themeSwitcherStyles: React.CSSProperties = {
  position: 'fixed',
  top: '24px',
  right: '24px',
  zIndex: 1000,
};

const headerStyles: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-secondary)',
  borderBottom: '1px solid var(--color-border-primary)',
  padding: 'var(--spacing-lg) 0',
  transition: 'all var(--transition-normal)',
};

const headerContentStyles: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 var(--spacing-xl)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--spacing-lg)',
};

const titleSectionStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-lg)',
};

const logoStyles: React.CSSProperties = {
  fontSize: '2rem',
};

const titleStyles: React.CSSProperties = {
  color: 'var(--color-primary-600)',
  margin: 0,
  fontSize: 'var(--font-size-3xl)',
  fontWeight: 'var(--font-weight-bold)',
  transition: 'color var(--transition-normal)',
};

const backButtonStyles: React.CSSProperties = {
  padding: 'var(--spacing-sm) var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-primary-500)',
  backgroundColor: 'var(--color-bg-secondary)',
  color: 'var(--color-primary-600)',
  cursor: 'pointer',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  transition: 'all var(--transition-normal)',
};

const tabsContainerStyles: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 var(--spacing-xl)',
  display: 'flex',
  gap: 'var(--spacing-sm)',
};

const getTabStyles = (isActive: boolean): React.CSSProperties => ({
  padding: 'var(--spacing-md) var(--spacing-lg)',
  borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0',
  border: 'none',
  backgroundColor: isActive ? 'var(--color-primary-500)' : 'var(--color-bg-tertiary)',
  color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
  cursor: 'pointer',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  transition: 'all var(--transition-normal)',
});

const tabIconStyles: React.CSSProperties = {
  fontSize: '1.1rem',
};

const contentWrapperStyles: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: 'var(--spacing-4xl) var(--spacing-xl)',
};

const contentStyles: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-secondary)',
  borderRadius: '0 var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg)',
  boxShadow: 'var(--shadow-lg)',
  minHeight: '600px',
  padding: 'var(--spacing-4xl)',
  transition: 'all var(--transition-normal)',
};

export default AdminPanel;