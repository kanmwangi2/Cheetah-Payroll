import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
// import { useThemeContext } from '../../../core/providers/ThemeProvider';
import ThemeSwitcher from '../../../shared/components/ui/ThemeSwitcher';
import ThemeBoundary from '../../../shared/components/ui/ThemeBoundary';
import CompanyManagement from './CompanyManagement';
import UserManagement from './UserManagement';
import TaxConfiguration from './TaxConfiguration';
import GlobalSettings from './GlobalSettings';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('companies');
  const [globalLogoUrl, setGlobalLogoUrl] = useState<string>('');
  const navigate = useNavigate();
  // ...existing code...

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
        // console.error('Error loading global logo:', error);
      }
    };

    loadGlobalLogo();
  }, []);

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
        {/* Header */}
        <div style={headerStyles}>
          <div style={headerContentStyles}>
            <div style={titleSectionStyles}>
              {globalLogoUrl ? (
                <img 
                  src={globalLogoUrl} 
                  alt="Application Logo" 
                  style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-inverse)',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  ⚙️
                </div>
              )}
              <h1 style={titleStyles}>
                Application Administration
              </h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-sm)' }}>
              <button
                onClick={() => navigate('/company-select')}
                style={backButtonStyles}
              >
                ← Back to Company Selection
              </button>
              {/* Theme Switcher */}
              <div style={themeSwitcherStyles}>
                <ThemeSwitcher variant="toggle" size="sm" showLabels={true} />
              </div>
            </div>
          </div>
          
          <div style={tabsContainerStyles}>
            <div className="tab-navigation style-pills">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
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
  marginTop: 'var(--spacing-md)',
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

// const logoStyles: React.CSSProperties = {
//   fontSize: '2rem',
// };

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