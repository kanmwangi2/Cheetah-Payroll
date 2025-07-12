import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../core/config/firebase.config';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import { useThemeContext } from '../../../core/providers/ThemeProvider';
import ThemeSwitcher from '../../../shared/components/ui/ThemeSwitcher';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import ThemeBoundary from '../../../shared/components/ui/ThemeBoundary';
import { Company } from '../../../shared/types';

const CompanySelector: React.FC<{ onSelect: (company: Company) => void }> = ({ onSelect }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  // const { isDark, resolvedTheme } = useThemeContext();

  // Load companies based on user access
  useEffect(() => {
    const loadUserCompanies = async () => {
      setLoading(true);
      try {
        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        const allCompanies: Company[] = [];
        
        companiesSnapshot.forEach((doc) => {
          allCompanies.push({
            id: doc.id,
            ...doc.data()
          } as Company);
        });
        
        // Filter companies based on user role and access
        let userCompanies: Company[] = [];
        
        if (user?.role === 'primary_admin' || user?.role === 'app_admin') {
          // Admins can see all companies
          userCompanies = allCompanies;
        } else {
          // Other users can only see companies they're assigned to
          userCompanies = allCompanies.filter(company => {
            // Check if user is assigned to this company
                  return user?.companyIds?.includes(company.id);
          });
        }
        
        setCompanies(userCompanies);
      } catch (error) {
        // console.error('Error loading companies:', error);
        setError('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserCompanies();
    }
  }, [user]);

  // Handle clicking outside combobox to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      // console.error('Error signing out:', error);
    }
  };

  const handleProceedToCompany = () => {
    if (!selectedCompany) return;
    onSelect(selectedCompany);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setSearchTerm(company.name || '');
    setIsDropdownOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
    // Clear selection if search doesn't match selected company
    if (selectedCompany && !selectedCompany.name?.toLowerCase().includes(value.toLowerCase())) {
      setSelectedCompany(null);
    }
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <LoadingSpinner message="Loading companies..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles}>
        <div style={errorStyles}>
          {error}
        </div>
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

        {/* Company Selection Card */}
        <div style={cardStyles}>
          {/* Header with logo and logout */}
          <div style={headerStyles}>
            <div style={logoContainerStyles}>
              <div style={logoStyles}>🐆</div>
              <h1 style={titleStyles}>
                Company Selection
              </h1>
            </div>
            <button
              onClick={handleLogout}
              style={logoutButtonStyles}
            >
              Logout
            </button>
          </div>

          {/* User info */}
          <div style={userInfoStyles}>
            <div style={welcomeTextStyles}>
              Welcome, {user?.name}
            </div>
            <div style={roleBadgeStyles}>
              {user?.role === 'primary_admin' ? 'Primary Admin' : 
               user?.role === 'app_admin' ? 'App Admin' : 
               user?.role === 'company_admin' ? 'Company Admin' :
               user?.role === 'payroll_approver' ? 'Payroll Approver' :
               user?.role === 'payroll_preparer' ? 'Payroll Preparer' : user?.role}
            </div>
          </div>

          {/* Company search and selection combobox */}
          <div style={formSectionStyles}>
            <label style={labelStyles}>
              Search and Select Company:
            </label>
            
            <div ref={comboboxRef} style={{ position: 'relative' }}>
              {/* Combobox input */}
              <input
                type="text"
                placeholder="Type to search companies..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                style={{
                  ...inputStyles,
                  paddingRight: '40px'
                }}
              />
              
              {/* Dropdown arrow */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  fontSize: '16px'
                }}
              >
                {isDropdownOpen ? '▲' : '▼'}
              </button>

              {/* Dropdown options */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  backgroundColor: 'var(--color-card-bg)',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {filteredCompanies.length === 0 ? (
                    <div style={{
                      padding: '12px',
                      color: 'var(--color-text-secondary)',
                      textAlign: 'center'
                    }}>
                      No companies found
                    </div>
                  ) : (
                    filteredCompanies.map(company => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleCompanySelect(company)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          textAlign: 'left',
                          background: selectedCompany?.id === company.id ? 'var(--color-button-ghost-hover)' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--color-card-border)',
                          color: 'var(--color-text-primary)',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-button-ghost-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = selectedCompany?.id === company.id ? 'var(--color-button-ghost-hover)' : 'transparent';
                        }}
                      >
                        {company.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Proceed button */}
          <button
            onClick={handleProceedToCompany}
            disabled={!selectedCompany}
            style={getProceedButtonStyles(!!selectedCompany)}
          >
            Proceed to Company Dashboard
          </button>

          {/* Admin Panel (only for primary_admin and app_admin) */}
          {(user?.role === 'primary_admin' || user?.role === 'app_admin') && (
            <div style={adminPanelStyles}>
              <h3 style={adminTitleStyles}>
                Administration
              </h3>
              <p style={adminDescriptionStyles}>
                Manage companies, users, and system settings
              </p>
              <button
                onClick={() => navigate('/admin')}
                style={adminButtonStyles}
              >
                Open Admin Panel
              </button>
            </div>
          )}
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

// Theme-aware styles
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
  backgroundColor: 'var(--color-bg-secondary)',
  borderRadius: 'var(--border-radius-xl)',
  padding: 'var(--spacing-4xl)',
  boxShadow: 'var(--shadow-xl)',
  border: '1px solid var(--color-border-primary)',
  width: '100%',
  maxWidth: '500px',
  transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--spacing-4xl)',
};

const logoContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
};

const logoStyles: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: 'var(--spacing-sm)',
};

const titleStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-2xl)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
  margin: 0,
  transition: 'color var(--transition-normal)',
};

const logoutButtonStyles: React.CSSProperties = {
  padding: 'var(--spacing-sm) var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-error-border)',
  backgroundColor: 'var(--color-bg-secondary)',
  color: 'var(--color-error-text)',
  cursor: 'pointer',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  transition: 'all var(--transition-normal)',
};

const userInfoStyles: React.CSSProperties = {
  marginBottom: 'var(--spacing-4xl)',
  textAlign: 'center',
};

const welcomeTextStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-lg)',
  fontWeight: 'var(--font-weight-medium)',
  marginBottom: 'var(--spacing-sm)',
  color: 'var(--color-text-primary)',
  transition: 'color var(--transition-normal)',
};

const roleBadgeStyles: React.CSSProperties = {
  display: 'inline-block',
  padding: 'var(--spacing-xs) var(--spacing-md)',
  backgroundColor: 'var(--color-primary-100)',
  color: 'var(--color-primary-700)',
  borderRadius: 'var(--border-radius-full)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  transition: 'all var(--transition-normal)',
};

const formSectionStyles: React.CSSProperties = {
  marginBottom: 'var(--spacing-4xl)',
};

const labelStyles: React.CSSProperties = {
  display: 'block',
  marginBottom: 'var(--spacing-sm)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-sm)',
  transition: 'color var(--transition-normal)',
};

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: 'var(--spacing-md) var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-border-secondary)',
  backgroundColor: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-base)',
  marginBottom: 'var(--spacing-md)',
  outline: 'none',
  transition: 'all var(--transition-normal)',
};

const selectStyles: React.CSSProperties = {
  width: '100%',
  padding: 'var(--spacing-md) var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-border-secondary)',
  backgroundColor: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-base)',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all var(--transition-normal)',
};

const getProceedButtonStyles = (enabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: 'var(--spacing-md) var(--spacing-xl)',
  borderRadius: 'var(--border-radius-md)',
  border: 'none',
  backgroundColor: enabled ? 'var(--color-primary-500)' : 'var(--color-gray-400)',
  color: 'var(--color-text-inverse)',
  fontWeight: 'var(--font-weight-semibold)',
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: 'var(--font-size-base)',
  marginBottom: 'var(--spacing-xl)',
  transition: 'all var(--transition-normal)',
  opacity: enabled ? 1 : 0.6,
});

const adminPanelStyles: React.CSSProperties = {
  padding: 'var(--spacing-xl)',
  backgroundColor: 'var(--color-bg-tertiary)',
  borderRadius: 'var(--border-radius-lg)',
  border: '1px solid var(--color-border-primary)',
  textAlign: 'center',
  transition: 'all var(--transition-normal)',
};

const adminTitleStyles: React.CSSProperties = {
  color: 'var(--color-primary-600)',
  marginBottom: 'var(--spacing-md)',
  fontSize: 'var(--font-size-lg)',
  fontWeight: 'var(--font-weight-semibold)',
  margin: '0 0 var(--spacing-md) 0',
  transition: 'color var(--transition-normal)',
};

const adminDescriptionStyles: React.CSSProperties = {
  marginBottom: 'var(--spacing-lg)',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--font-size-sm)',
  margin: '0 0 var(--spacing-lg) 0',
  transition: 'color var(--transition-normal)',
};

const adminButtonStyles: React.CSSProperties = {
  padding: 'var(--spacing-sm) var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-primary-500)',
  backgroundColor: 'var(--color-bg-secondary)',
  color: 'var(--color-primary-600)',
  fontWeight: 'var(--font-weight-medium)',
  cursor: 'pointer',
  fontSize: 'var(--font-size-sm)',
  transition: 'all var(--transition-normal)',
};

const errorStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  color: 'var(--color-error-text)',
  fontSize: 'var(--font-size-lg)',
  fontWeight: 'var(--font-weight-medium)',
  backgroundColor: 'var(--color-error-bg)',
  padding: 'var(--spacing-xl)',
  borderRadius: 'var(--border-radius-lg)',
  border: '1px solid var(--color-error-border)',
  transition: 'all var(--transition-normal)',
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

export default CompanySelector;
