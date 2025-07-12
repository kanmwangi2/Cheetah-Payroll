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
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 1020,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
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
          {/* Left Side - Logo and Company */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
              background: '#e5e7eb' 
            }} />
            
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
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
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#2563eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {roleLabels[user?.role || ''] || user?.role}
                  </div>
                </div>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>▼</span>
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  minWidth: '200px',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{user?.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{user?.email}</div>
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
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
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
                  background: isActive(item.path) ? '#eff6ff' : 'transparent',
                  border: 'none',
                  borderRight: isActive(item.path) ? '3px solid #2563eb' : '3px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? '#2563eb' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    (e.target as HTMLButtonElement).style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    (e.target as HTMLButtonElement).style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
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