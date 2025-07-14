import * as React from 'react';
import { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './assets/styles/components.css';
import { AuthGuard } from './core/guards/AuthGuard';
import { useAuthContext } from './core/providers/AuthProvider';
import CompanySelector from './features/auth/components/CompanySelector';
import { Company } from './shared/types';
import LoadingSpinner from './shared/components/ui/LoadingSpinner';
import MainLayout from './shared/components/layout/MainLayout';
import { APP_CONSTANTS } from './shared/constants/app.constants';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

// Lazy load feature modules with webpack chunk names for better splitting
const Dashboard = lazy(() => 
  import(/* webpackChunkName: "dashboard" */ './features/dashboard/components/Dashboard')
);
const StaffList = lazy(() => 
  import(/* webpackChunkName: "staff" */ './features/staff/components/StaffList')
);
const PaymentsList = lazy(() => 
  import(/* webpackChunkName: "payments" */ './features/payments/components/PaymentsList')
);
const DeductionsList = lazy(() => 
  import(/* webpackChunkName: "deductions" */ './features/deductions/components/DeductionsList')
);
const PayrollList = lazy(() => 
  import(/* webpackChunkName: "payroll" */ './features/payroll/components/PayrollList')
);
const Reports = lazy(() => 
  import(/* webpackChunkName: "reports" */ './features/reports/components/EnhancedReports')
);
const Utilities = lazy(() => 
  import(/* webpackChunkName: "utilities" */ './features/utilities/components/Utilities')
);
const AdminPanel = lazy(() => 
  import(/* webpackChunkName: "admin" */ './features/admin/components/AdminPanel')
);

// Main App Content Component
const AppContent: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const { user } = useAuthContext();

  if (!user) {
    return null; // AuthGuard handles this case
  }
  if (!company) {
    return <CompanySelector onSelect={setCompany} />;
  }

  return (
    <MainLayout 
      company={company} 
      onSwitchCompany={() => setCompany(null)}
    >
      <Suspense fallback={<LoadingSpinner message={APP_CONSTANTS.LOADING_MESSAGES.GENERIC} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ErrorBoundary>
              <Dashboard companyId={company.id} />
            </ErrorBoundary>
          } />
          <Route path="/staff" element={
            <ErrorBoundary>
              <StaffList companyId={company.id} />
            </ErrorBoundary>
          } />
          <Route path="/payments" element={
            <ErrorBoundary>
              <PaymentsList companyId={company.id} />
            </ErrorBoundary>
          } />
          <Route path="/deductions" element={
            <ErrorBoundary>
              <DeductionsList companyId={company.id} />
            </ErrorBoundary>
          } />
          <Route path="/payroll" element={
            <ErrorBoundary>
              <PayrollList companyId={company.id} />
            </ErrorBoundary>
          } />
          <Route path="/reports" element={
            <ErrorBoundary>
              <Reports companyId={company.id} />
            </ErrorBoundary>
          } />
          <Route path="/utilities" element={
            <ErrorBoundary>
              <Utilities companyId={company.id} companyName={company.name} />
            </ErrorBoundary>
          } />
          <Route path="/admin" element={
            <ErrorBoundary>
              <AdminPanel />
            </ErrorBoundary>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
};

export default App;
