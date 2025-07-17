import React, { useState } from 'react';
import AdvancedUtilities from './AdvancedUtilities';
import AuditTrail from '../../../shared/components/AuditTrail';
import FAQ from '../../help/components/FAQ';
import Documentation from '../../help/components/Documentation';


interface UtilitiesProps {
  companyId: string;
  companyName: string;
}

const Utilities: React.FC<UtilitiesProps> = ({ companyId, companyName }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'docs' | 'backup' | 'audit'>('faq');


  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return <FAQ />;

      case 'docs':
        return <Documentation />;

      case 'backup':
        return (
          <div className="backup-utilities-content">
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>Backup & Restore</h3>
            <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
              Backup and restore all company data, including staff, payments, deductions, and payroll records.
            </p>
            <AdvancedUtilities companyId={companyId} companyName={companyName} />
          </div>
        );

      case 'audit':
        return (
          <div className="audit-content">
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>Audit Trail</h3>
            <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
              Complete audit log of all system activities, user actions, and data changes.
            </p>
            <AuditTrail companyId={companyId} entityId="system" entityType="utilities" />
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
      <div className="tab-navigation style-pills">
        {[
          { key: 'faq', label: 'FAQ', icon: '❓' },
          { key: 'docs', label: 'Documentation', icon: '📄' },
          { key: 'backup', label: 'Backup', icon: '💾' },
          { key: 'audit', label: 'Audit Trail', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
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
