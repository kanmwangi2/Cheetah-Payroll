import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../../core/config/firebase.config';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import { Company } from '../../types';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import UserProfile from '../../../features/profile/components/UserProfile';
import CompanySettings from '../../../features/settings/components/CompanySettings';

interface MainLayoutProps {
  children: React.ReactNode;
  company: Company;
  onSwitchCompany: () => void;
}

const roleLabels: Record<string, string> = {
  primary_admin: 'Primary Admin',
  app_admin: 'App Admin',
  company_admin: 'Company Admin',
  payroll_approver: 'Payroll Approver',
  payroll_preparer: 'Payroll Preparer',
};

const MainLayout: React.FC<MainLayoutProps> = ({ children, company, onSwitchCompany }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showCompanySettings, setShowCompanySettings] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { id: 'staff', label: 'Staff', icon: '👥', path: '/staff' },
    { id: 'payments', label: 'Payments', icon: '💰', path: '/payments' },
    { id: 'deductions', label: 'Deductions', icon: '📉', path: '/deductions' },
    { id: 'payroll', label: 'Payroll', icon: '📊', path: '/payroll' },
    { id: 'reports', label: 'Reports', icon: '📋', path: '/reports' },
    { id: 'utilities', label: 'Utilities', icon: '🔧', path: '/utilities' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: 'var(--color-nav-bg)',
        borderBottom: '1px solid var(--color-nav-border)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 var(--spacing-2xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Left Side - Logo and Company */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400))',
                borderRadius: 'var(--border-radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-inverse)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-sm)'
              }}>
                CP
              </div>
              <h1 style={{ 
                margin: 0, 
                fontSize: 'var(--font-size-xl)', 
                fontWeight: 'var(--font-weight-semibold)', 
                color: 'var(--color-primary-600)' 
              }}>
                Cheetah Payroll
              </h1>
            </div>
            
            <div style={{ 
              height: 'var(--spacing-2xl)', 
              width: '1px', 
              background: 'var(--color-border-primary)' 
            }} />
            
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <strong>{company.name}</strong>
            </div>
          </div>

          {/* Right Side - Theme Toggle and User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <ThemeSwitcher variant="toggle" size="sm" showLabels={false} />
            
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--border-radius-lg)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--color-primary-600)',
                  borderRadius: 'var(--border-radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-inverse)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{user?.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {roleLabels[user?.role || ''] || user?.role}
                  </div>
                </div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>▼</span>
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 'var(--spacing-xs)',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--border-radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: '200px',
                  zIndex: 'var(--z-dropdown)'
                }}>
                  <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-primary)' }}>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{user?.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{user?.email}</div>
                  </div>
                  
                  <div style={{ padding: 'var(--spacing-sm) 0' }}>
                    <button
                      onClick={() => {
                        setShowUserProfile(true);
                        setShowUserMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#333'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = '#f8f9fa'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'none'}
                    >
                      👤 User Profile
                    </button>
                    
                    {(user?.role === 'primary_admin' || user?.role === 'app_admin' || user?.role === 'company_admin') && (
                      <button
                        onClick={() => {
                          setShowCompanySettings(true);
                          setShowUserMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: '#333'
                        }}
                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = '#f8f9fa'}
                        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'none'}
                      >
                        🏢 Company Settings
                      </button>
                    )}
                    
                    <button
                      onClick={onSwitchCompany}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#333'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = '#f8f9fa'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'none'}
                    >
                      🔄 Switch Company
                    </button>
                    
                    {(user?.role === 'primary_admin' || user?.role === 'app_admin') && (
                      <button
                        onClick={() => navigate('/admin')}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: '#333'
                        }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#f8f9fa')}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'none')}
                      >
                        ⚙️ Admin Panel
                      </button>
                    )}
                    
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e9ecef' }} />
                    
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#dc3545'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = '#f8f9fa'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'none'}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Side Navigation */}
        <div style={{
          width: '240px',
          background: '#fff',
          borderRight: '1px solid #e9ecef',
          padding: '24px 0'
        }}>
          <nav>
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: isActive(item.path) ? '#e3f2fd' : 'transparent',
                  border: 'none',
                  borderRight: isActive(item.path) ? '3px solid #1976d2' : '3px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? '#1976d2' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    (e.target as HTMLButtonElement).style.background = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    (e.target as HTMLButtonElement).style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: '24px' }}>
          {children}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowUserProfile(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <UserProfile />
          </div>
        </div>
      )}

      {/* Company Settings Modal */}
      {showCompanySettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            maxWidth: '1000px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCompanySettings(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <CompanySettings companyId={company.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;