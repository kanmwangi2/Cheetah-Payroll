import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {return;}
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

  if (loading) {return <div>Loading companies...</div>;}
  if (error) {return <div style={{ color: 'red' }}>{error}</div>;}
  if (!user) {return <div>User not found.</div>;}

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

  const handleCompanySelect = () => {
    const company = companies.find(c => c.id === selectedCompanyId);
    if (company) {
      onSelect(company);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#1976d2', margin: 0 }}>
          Welcome to Cheetah Payroll
        </h2>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #dc3545',
            background: '#fff',
            color: '#dc3545',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = '#dc3545';
            (e.target as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = '#fff';
            (e.target as HTMLButtonElement).style.color = '#dc3545';
          }}
        >
          🚪 Logout
        </button>
      </div>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>{user.name}</span>{' '}
        <span style={{ 
          color: '#1976d2', 
          fontWeight: 600, 
          marginLeft: 8,
          backgroundColor: '#e3f2fd',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '0.9rem'
        }}>
          {roleLabels[user.role]}
        </span>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 8, 
          fontWeight: 500,
          color: '#333'
        }}>
          Select Company:
        </label>
        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 6,
            border: '2px solid #e0e0e0',
            fontSize: '1rem',
            background: '#fff',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#1976d2'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        >
          <option value="">Choose a company...</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleCompanySelect}
          disabled={!selectedCompanyId}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '12px 24px',
            borderRadius: 6,
            border: 'none',
            background: selectedCompanyId ? '#1976d2' : '#ccc',
            color: '#fff',
            fontWeight: 600,
            cursor: selectedCompanyId ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            transition: 'background-color 0.2s'
          }}
        >
          Continue to Dashboard
        </button>
      </div>
      {(user.role === 'primary_admin' || user.role === 'app_admin') && (
        <div
          style={{
            padding: 24,
            background: '#f8f9fa',
            borderRadius: 8,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <h3 style={{ 
            color: '#1976d2', 
            marginBottom: 16, 
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            Application Administration
          </h3>
          <p style={{ 
            textAlign: 'center', 
            marginBottom: 20, 
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Manage companies, users, tax settings, and global configuration
          </p>
          <button
            onClick={() => navigate('/admin')}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: 6,
              border: '2px solid #1976d2',
              background: '#fff',
              color: '#1976d2',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = '#1976d2';
              (e.target as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = '#fff';
              (e.target as HTMLButtonElement).style.color = '#1976d2';
            }}
          >
            Open Admin Panel
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
