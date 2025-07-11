import React, { useEffect, useState } from 'react';
import { getUserProfile, getCompaniesByIds } from '../../../shared/services/user.service';
import { auth } from '../../../core/config/firebase.config';
import { User, Company } from '../../../shared/types';

const roleLabels: Record<string, string> = {
  primary_admin: 'Primary Admin',
  app_admin: 'App Admin',
  company_admin: 'Company Admin',
  payroll_approver: 'Payroll Approver',
  payroll_preparer: 'Payroll Preparer',
};

const CompanySelector: React.FC<{ onSelect: (company: Company) => void }> = ({ onSelect }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    getUserProfile(currentUser.uid)
      .then(profile => {
        setUser(profile);
        if (profile && profile.companyIds) {
          return getCompaniesByIds(profile.companyIds).then(setCompanies);
        } else {
          setCompanies([]);
        }
      })
      .catch(e => setError(e.message || 'Failed to load companies'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading companies...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div>User not found.</div>;

  if (companies.length === 0) {
    return (
      <div>
        <h2>Welcome to Cheetah Payroll</h2>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 500 }}>{user.name}</span>{' '}
          <span style={{ color: '#1976d2', fontWeight: 600, marginLeft: 8 }}>
            {roleLabels[user.role]}
          </span>
        </div>
        <p>No companies found. Please contact your administrator to be assigned to a company.</p>
        {(user.role === 'primary_admin' || user.role === 'app_admin') && (
          <div
            style={{
              marginTop: 32,
              padding: 24,
              background: '#f4f6fb',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
            }}
          >
            <h3 style={{ color: '#1976d2', marginBottom: 12 }}>Admin Panel</h3>
            <p>As an administrator, you can create companies and manage users.</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <a
                  href="/admin/companies"
                  style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                >
                  Company Management
                </a>
              </li>
              <li>
                <a
                  href="/admin/users"
                  style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                >
                  User Management
                </a>
              </li>
              <li>
                <a
                  href="/admin/tax"
                  style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                >
                  Tax Configuration
                </a>
              </li>
              <li>
                <a
                  href="/admin/settings"
                  style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                >
                  Global Application Settings
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Select Company</h2>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontWeight: 500 }}>{user.name}</span>{' '}
        <span style={{ color: '#1976d2', fontWeight: 600, marginLeft: 8 }}>
          {roleLabels[user.role]}
        </span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {companies.map(c => (
          <li key={c.id} style={{ marginBottom: 12 }}>
            <button
              style={{
                padding: '10px 24px',
                borderRadius: 6,
                border: '1px solid #1976d2',
                background: '#fff',
                color: '#1976d2',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
              onClick={() => onSelect(c)}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
      {(user.role === 'primary_admin' || user.role === 'app_admin') && (
        <div
          style={{
            marginTop: 32,
            padding: 24,
            background: '#f4f6fb',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
          }}
        >
          <h3 style={{ color: '#1976d2', marginBottom: 12 }}>Admin Panel</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <a
                href="/admin/companies"
                style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
              >
                Company Management
              </a>
            </li>
            <li>
              <a
                href="/admin/users"
                style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
              >
                User Management
              </a>
            </li>
            <li>
              <a
                href="/admin/tax"
                style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
              >
                Tax Configuration
              </a>
            </li>
            <li>
              <a
                href="/admin/settings"
                style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
              >
                Global Application Settings
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
