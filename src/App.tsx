import React, { useState, Suspense, lazy } from 'react';
import './App.css';
import { AppProvider } from './core/providers/AppProvider';
import { AuthGuard } from './core/guards/AuthGuard';
import { useAuthContext } from './core/providers/AuthProvider';
import { useThemeContext } from './core/providers/ThemeProvider';
import CompanySelector from './features/auth/components/CompanySelector';
import { Company } from './shared/types';
import LoadingSpinner from './shared/components/ui/LoadingSpinner';
import ThemeSwitcher from './shared/components/ui/ThemeSwitcher';

// Lazy load feature modules
const StaffList = lazy(() => import('./features/staff/components/StaffList'));
const PaymentsList = lazy(() => import('./features/payments/components/PaymentsList'));
const DeductionsList = lazy(() => import('./features/deductions/components/DeductionsList'));
const PayrollList = lazy(() => import('./features/payroll/components/PayrollList'));
const Reports = lazy(() => import('./features/reports/components/Reports'));
const Utilities = lazy(() => import('./features/utilities/components/Utilities'));
const Dashboard = lazy(() => import('./features/dashboard/components/Dashboard'));

// Main App Content Component
const AppContent: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const { user } = useAuthContext();
  const { theme, resolvedTheme, isDark, isSystemTheme } = useThemeContext();

  if (!user) return null; // AuthGuard handles this case
  if (!company) return <CompanySelector onSelect={setCompany} />;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        transition: 'background-color var(--transition-normal), color var(--transition-normal)',
      }}
    >
      {/* Theme Switcher */}
      <ThemeSwitcher variant="dropdown" position="top-right" showLabels={true} />

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-6xl)', // Space for theme switcher
        }}
      >
        <header
          style={{
            marginBottom: 'var(--spacing-4xl)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--font-size-4xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            Welcome to Cheetah Payroll
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--spacing-lg)',
              flexWrap: 'wrap',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              User:{' '}
              <span
                style={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                {user.email}
              </span>
            </p>

            <span
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                backgroundColor: 'var(--color-primary-500)',
                color: 'var(--color-text-inverse)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {user.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Company:{' '}
            <span
              style={{
                color: 'var(--color-text-primary)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {company.name}
            </span>
          </p>

          {/* Theme Status Indicator */}
          <div
            style={{
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-tertiary)',
              display: 'inline-block',
            }}
          >
            Theme: {theme} {isSystemTheme && `(${resolvedTheme})`} {isDark ? '🌙' : '☀️'}
          </div>
        </header>

        <main>
          <Suspense fallback={<LoadingSpinner message="Loading module..." />}>
            <div
              style={{
                display: 'grid',
                gap: 'var(--spacing-2xl)',
                gridTemplateColumns: '1fr',
              }}
            >
              <Dashboard companyId={company.id} />
              <StaffList companyId={company.id} />
              <PaymentsList companyId={company.id} />
              <DeductionsList companyId={company.id} />
              <PayrollList companyId={company.id} />
              <Reports companyId={company.id} />
              <Utilities />
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    </AppProvider>
  );
};

export default App;
