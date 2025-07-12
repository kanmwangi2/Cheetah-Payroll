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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { id: 'staff', label: 'Staff', icon: '👥', path: '/staff' },
    { id: 'payments', label: 'Payments', icon: '💰', path: '/payments' },
    { id: 'deductions', label: 'Deductions', icon: '📉', path: '/deductions' },
    { id: 'payroll', label: 'Payroll', icon: '📊', path: '/payroll' },
    { id: 'reports', label: 'Reports', icon: '📋', path: '/reports' },
    { id: 'utilities', label: 'Utilities', icon: '🔧', path: '/utilities' },
    { id: 'faq', label: 'FAQ', icon: '❓', path: '/faq' },
    { id: 'documentation', label: 'Documentation', icon: '📚', path: '/documentation' },
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
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: 'var(--color-nav-bg)',
        borderBottom: '1px solid var(--color-nav-border)',
        position: 'sticky',
        top: 0,
        zIndex: 1020,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Left Side - Menu Toggle, Logo and Company */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--color-nav-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? '☰' : '⟨'}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                CP
              </div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#2563eb' 
              }}>
                Cheetah Payroll
              </h1>
            </div>
            
            <div style={{ 
              height: '24px', 
              width: '1px', 
              background: 'var(--color-nav-border)' 
            }} />
            
            <div style={{ color: 'var(--color-nav-text)', fontSize: '14px' }}>
              <strong>{company.name}</strong>
            </div>
          </div>

          {/* Right Side - Theme Toggle and User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeSwitcher variant="toggle" size="sm" showLabels={false} />
            
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-nav-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--color-primary-600)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-inverse)',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {roleLabels[user?.role || ''] || user?.role}
                  </div>
                </div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>▼</span>
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: '200px',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-primary)' }}>
                    <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{user?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{user?.email}</div>
                  </div>
                  
                  <div style={{ padding: '8px 0' }}>
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
                        color: 'var(--color-text-primary)'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'var(--color-table-row-hover)'}
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
                          color: 'var(--color-text-primary)'
                        }}
                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'var(--color-table-row-hover)'}
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
                        color: 'var(--color-text-primary)'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'var(--color-table-row-hover)'}
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
                          color: 'var(--color-text-primary)'
                        }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'var(--color-table-row-hover)')}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'none')}
                      >
                        ⚙️ Admin Panel
                      </button>
                    )}
                    
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-border-primary)' }} />
                    
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
                        color: 'var(--color-error-text)'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'var(--color-table-row-hover)'}
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
          width: sidebarCollapsed ? '60px' : '240px',
          background: 'var(--color-nav-bg)',
          borderRight: '1px solid var(--color-nav-border)',
          padding: '24px 0',
          transition: 'width 0.3s ease',
          overflow: 'hidden'
        }}>
          <nav>
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  padding: sidebarCollapsed ? '12px' : '12px 24px',
                  background: isActive(item.path) ? 'var(--color-primary-50)' : 'transparent',
                  border: 'none',
                  borderRight: isActive(item.path) ? '3px solid var(--color-primary-500)' : '3px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? 'var(--color-nav-text-active)' : 'var(--color-nav-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  gap: sidebarCollapsed ? '0' : '12px',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    (e.target as HTMLButtonElement).style.background = 'var(--color-table-row-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    (e.target as HTMLButtonElement).style.background = 'transparent';
                  }
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {!sidebarCollapsed && item.label}
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
          background: 'var(--color-bg-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-card-bg)',
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
                zIndex: 1001,
                color: 'var(--color-text-secondary)'
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
          background: 'var(--color-bg-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-card-bg)',
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
                zIndex: 1001,
                color: 'var(--color-text-secondary)'
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