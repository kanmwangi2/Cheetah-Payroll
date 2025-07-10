import React, { useState, useEffect, Suspense, lazy, createContext, useContext } from 'react';
import './App.css';
// import Login from './components/Login';
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


type Theme = 'light' | 'dark' | 'system';
const ThemeContext = createContext<{theme: Theme, setTheme: (t: Theme) => void}>({ theme: 'system', setTheme: () => {} });

function useSystemTheme() {
  const getSystem = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystem());
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemTheme(getSystem());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return systemTheme;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const systemTheme = useSystemTheme();

  useEffect(() => {
    const applied = theme === 'system' ? systemTheme : theme;
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${applied}`);
    localStorage.setItem('theme', theme);
  }, [theme, systemTheme]);

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
  if (!user) return null;
  if (!company) return <CompanySelector onSelect={setCompany} />;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div>
        <ThemeSwitcher />
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
    </ThemeContext.Provider>
  );

}

function ThemeSwitcher() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <div style={{ position: 'absolute', top: 10, right: 10 }}>
      <label htmlFor="theme-select" style={{ marginRight: 8 }}>Theme:</label>
      <select id="theme-select" value={theme} onChange={e => setTheme(e.target.value as any)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

export default App;
