import React, { useState } from 'react';
import AdvancedUtilities from './AdvancedUtilities';
import AuditTrail from '../../../shared/components/AuditTrail';
import FAQ from '../../help/components/FAQ';
import Documentation from '../../help/components/Documentation';


const Utilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'docs' | 'advanced' | 'audit'>('faq');


  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return <FAQ />;

      case 'docs':
        return <Documentation />;

      case 'advanced':
        return (
          <div className="advanced-utilities-content">
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>Advanced Tools</h3>
            <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
              Advanced system utilities for data management, system maintenance, and administrative tasks.
            </p>
            <AdvancedUtilities />
          </div>
        );

      case 'audit':
        return (
          <div className="audit-content">
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>Audit Trail</h3>
            <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
              Complete audit log of all system activities, user actions, and data changes.
            </p>
            <AuditTrail entityId="system" entityType="utilities" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="utilities-module" style={{ 
      padding: 'var(--spacing-xl)', 
      backgroundColor: 'var(--color-bg-primary)',
      minHeight: '100vh'
    }}>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xl)' }}>Utilities & Support</h2>
      
      {/* Horizontal Tab Navigation */}
      <div className="tab-navigation" style={{ 
        display: 'flex',
        borderBottom: '2px solid var(--color-border-primary)',
        marginBottom: 'var(--spacing-xl)',
        gap: '4px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'faq', label: 'FAQ', icon: '❓' },
          { key: 'docs', label: 'Documentation', icon: '📄' },
          { key: 'advanced', label: 'Advanced', icon: '⚙️' },
          { key: 'audit', label: 'Audit Trail', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--color-primary-500)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.key ? '600' : 'normal',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)',
              borderRadius: '8px 8px 0 0'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-bg-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--spacing-xl)',
        boxShadow: 'var(--shadow-md)'
      }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Utilities;
