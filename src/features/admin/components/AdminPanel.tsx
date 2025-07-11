import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyManagement from './CompanyManagement';
import UserManagement from './UserManagement';
import TaxConfiguration from './TaxConfiguration';
import GlobalSettings from './GlobalSettings';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('companies');
  const navigate = useNavigate();

  const tabs = [
    { id: 'companies', label: 'Company Management', icon: '🏢' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'tax', label: 'Tax Configuration', icon: '📊' },
    { id: 'settings', label: 'Global Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'companies':
        return <CompanyManagement />;
      case 'users':
        return <UserManagement />;
      case 'tax':
        return <TaxConfiguration />;
      case 'settings':
        return <GlobalSettings />;
      default:
        return <CompanyManagement />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e9ecef',
        padding: '16px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h1 style={{ 
              color: '#1976d2', 
              margin: 0,
              fontSize: '1.8rem',
              fontWeight: 600
            }}>
              Application Administration
            </h1>
            <button
              onClick={() => navigate('/company-select')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #1976d2',
                background: '#fff',
                color: '#1976d2',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              ← Back to Company Selection
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  background: activeTab === tab.id ? '#1976d2' : '#e9ecef',
                  color: activeTab === tab.id ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '0 8px 8px 8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: '600px',
          padding: '32px'
        }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;