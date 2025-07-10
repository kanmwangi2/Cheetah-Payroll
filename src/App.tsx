import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import Login from './components/Login';
import CompanySelector from './components/CompanySelector';
import { onUserChanged } from './auth';
import { getUserProfile } from './userUtils';
import { User, Company } from './types';
const StaffList = lazy(() => import('./components/StaffList'));
const PaymentsList = lazy(() => import('./components/PaymentsList'));
const DeductionsList = lazy(() => import('./components/DeductionsList'));
const PayrollList = lazy(() => import('./components/PayrollList'));
const Reports = lazy(() => import('./components/Reports'));
const Utilities = lazy(() => import('./components/Utilities'));
const Dashboard = lazy(() => import('./components/Dashboard'));

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const unsubscribe = onUserChanged(async u => {
      if (u) {
        const profile = await getUserProfile(u.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login onSuccess={() => window.location.reload()} />;
  if (!company) return <CompanySelector onSelect={setCompany} />;

  return (
    <div>
      <h1>Welcome to Cheetah Payroll</h1>
      <p>User: {user.email} <span style={{ color: '#1976d2', fontWeight: 600, marginLeft: 8 }}>{user.role.replace('_', ' ').toUpperCase()}</span></p>
      <p>Company: {company.name}</p>
      <Suspense fallback={<div>Loading module...</div>}>
        <Dashboard companyId={company.id} />
        <hr />
        <StaffList companyId={company.id} />
        <hr />
        <PaymentsList companyId={company.id} />
        <hr />
        <DeductionsList companyId={company.id} />
        <hr />
        <PayrollList companyId={company.id} />
        <hr />
        <Reports companyId={company.id} />
        <hr />
        <Utilities />
      </Suspense>
    </div>
  );
};

export default App;
