import React, { useState, useEffect, Suspense, lazy } from 'react';
import Login from './components/Login';
import CompanySelector from './components/CompanySelector';
import { onUserChanged } from './auth';
const StaffList = lazy(() => import('./components/StaffList'));
const PaymentsList = lazy(() => import('./components/PaymentsList'));
const DeductionsList = lazy(() => import('./components/DeductionsList'));
const PayrollList = lazy(() => import('./components/PayrollList'));
const Reports = lazy(() => import('./components/Reports'));
const Utilities = lazy(() => import('./components/Utilities'));

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onUserChanged(u => {
      setUser(u);
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
      <p>User: {user.email}</p>
      <p>Company: {company.name}</p>
      <Suspense fallback={<div>Loading module...</div>}>
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
