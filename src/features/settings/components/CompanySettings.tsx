type PasswordPolicy = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
  [key: string]: number | boolean;
};
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import { Company } from '../../../shared/types';
import { useAuthContext } from '../../../core/providers/AuthProvider';

interface CompanySettingsProps {
  companyId: string;
}
const CompanySettings: React.FC<CompanySettingsProps> = ({ companyId }) => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    sector: '',
    settings: {
      timezone: 'Africa/Kigali',
      currency: 'RWF',
      fiscalYearStart: 'January',
      payrollFrequency: 'monthly',
      defaultWorkingDays: 22,
      defaultWorkingHours: 8,
      enableOvertimeCalculation: true,
      overtimeMultiplier: 1.5,
      enableAdvancePayments: true,
      maxAdvancePercentage: 50,
      requirePayrollApproval: true,
      enableAuditTrail: true,
      backupFrequency: 'daily',
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        maxAge: 90
      } as PasswordPolicy
    }
  });

  const tabs = [
    { id: 'general', label: 'General Information', icon: '🏢' },
    { id: 'payroll', label: 'Payroll Settings', icon: '💰' },
    { id: 'security', label: 'Security & Access', icon: '🔒' },
    { id: 'backup', label: 'Backup & Audit', icon: '💾' }
  ];

  const sectors = [
    'Agriculture', 'Banking & Finance', 'Construction', 'Education', 'Energy',
    'Healthcare', 'Hospitality', 'ICT', 'Manufacturing', 'Mining',
    'Non-Profit', 'Real Estate', 'Retail', 'Services', 'Tourism',
    'Transportation', 'Other'
  ];

  const timezones = [
    'Africa/Kigali', 'Africa/Nairobi', 'Africa/Kampala', 'Africa/Dar_es_Salaam',
    'UTC', 'Africa/Lagos', 'Africa/Cairo'
  ];

  const currencies = [
    { code: 'RWF', name: 'Rwandan Franc' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' },
    { code: 'TZS', name: 'Tanzanian Shilling' }
  ];

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      if (companyDoc.exists()) {
        const companyData = { id: companyDoc.id, ...companyDoc.data() } as Company;
        setCompany(companyData);
        
        // Merge with default settings
        const defaultSettings = formData.settings;
        const currentSettings = companyData.settings || {};
        
        setFormData({
          name: companyData.name || '',
          email: companyData.email || '',
          phone: companyData.phone || '',
          address: companyData.address || '',
          taxId: companyData.taxId || '',
          sector: companyData.sector || '',
          settings: {
            ...defaultSettings,
            ...currentSettings
          }
        });
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        ...formData,
        updatedAt: new Date()
      });
      
      alert('Company settings updated successfully!');
    } catch (error) {
      console.error('Error updating company settings:', error);
      alert('Error updating company settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const handlePasswordPolicyChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        passwordPolicy: {
          ...prev.settings.passwordPolicy,
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#666' }}>Loading company settings...</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'primary_admin' || user?.role === 'app_admin' || user?.role === 'company_admin';

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>
          Company Settings
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
          Manage your company information and system preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #e9ecef',
        marginBottom: '24px',
        gap: '4px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? '#1976d2' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#666',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.id ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                (e.target as HTMLButtonElement).style.background = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                (e.target as HTMLButtonElement).style.background = 'transparent';
              }
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Information Tab */}
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Tax ID / TIN
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Business Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Business Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              >
                <option value="">Select sector...</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Payroll Settings Tab */}
        {activeTab === 'payroll' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Timezone
              </label>
              <select
                value={formData.settings.timezone}
                onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Currency
              </label>
              <select
                value={formData.settings.currency}
                onChange={(e) => handleSettingsChange('currency', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Default Working Days per Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.settings.defaultWorkingDays}
                onChange={(e) => handleSettingsChange('defaultWorkingDays', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Default Working Hours per Day
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.settings.defaultWorkingHours}
                onChange={(e) => handleSettingsChange('defaultWorkingHours', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="enableOvertimeCalculation"
                  checked={formData.settings.enableOvertimeCalculation}
                  onChange={(e) => handleSettingsChange('enableOvertimeCalculation', e.target.checked)}
                  disabled={!isAdmin}
                />
                <label htmlFor="enableOvertimeCalculation" style={{ fontWeight: 500, color: '#333' }}>
                  Enable Overtime Calculation
                </label>
              </div>
              
              {formData.settings.enableOvertimeCalculation && (
                <div style={{ marginLeft: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                    Overtime Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="3"
                    value={formData.settings.overtimeMultiplier}
                    onChange={(e) => handleSettingsChange('overtimeMultiplier', parseFloat(e.target.value))}
                    style={{
                      width: '200px',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                    disabled={!isAdmin}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security & Access Tab */}
        {activeTab === 'security' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="requirePayrollApproval"
                checked={formData.settings.requirePayrollApproval}
                onChange={(e) => handleSettingsChange('requirePayrollApproval', e.target.checked)}
                disabled={!isAdmin}
              />
              <label htmlFor="requirePayrollApproval" style={{ fontWeight: 500, color: '#333' }}>
                Require Payroll Approval Workflow
              </label>
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                Password Policy
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="32"
                    value={formData.settings.passwordPolicy.minLength}
                    onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                    disabled={!isAdmin}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                    Password Max Age (days)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={formData.settings.passwordPolicy.maxAge}
                    onChange={(e) => handlePasswordPolicyChange('maxAge', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                    disabled={!isAdmin}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {[
                    { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                    { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                    { key: 'requireNumbers', label: 'Require Numbers' },
                    { key: 'requireSpecialChars', label: 'Require Special Characters' }
                  ].map(policy => (
                    <div key={policy.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id={policy.key}
                        checked={Boolean(formData.settings.passwordPolicy[policy.key])}
                        onChange={(e) => handlePasswordPolicyChange(policy.key, e.target.checked)}
                        disabled={!isAdmin}
                      />
                      <label htmlFor={policy.key} style={{ fontSize: '0.9rem', color: '#333' }}>
                        {policy.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup & Audit Tab */}
        {activeTab === 'backup' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="enableAuditTrail"
                checked={formData.settings.enableAuditTrail}
                onChange={(e) => handleSettingsChange('enableAuditTrail', e.target.checked)}
                disabled={!isAdmin}
              />
              <label htmlFor="enableAuditTrail" style={{ fontWeight: 500, color: '#333' }}>
                Enable Audit Trail Logging
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Automatic Backup Frequency
              </label>
              <select
                value={formData.settings.backupFrequency}
                onChange={(e) => handleSettingsChange('backupFrequency', e.target.value)}
                style={{
                  width: '300px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
                disabled={!isAdmin}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, color: '#333' }}>
                Data Retention Information
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '0.9rem' }}>
                <li>Payroll records are retained indefinitely for compliance</li>
                <li>Audit logs are retained for a minimum of 7 years</li>
                <li>User activity logs are retained for 1 year</li>
                <li>Backup files are retained based on your selected frequency</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isAdmin && (
          <div style={{ 
            marginTop: '32px', 
            padding: '24px 0',
            borderTop: '1px solid #e9ecef',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px',
                background: saving ? '#6c757d' : '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Changes
                </>
              )}
            </button>
          </div>
        )}

        {!isAdmin && (
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            color: '#856404',
            fontSize: '0.9rem'
          }}>
            <strong>View Only:</strong> You do not have permission to modify company settings. Contact your administrator if changes are needed.
          </div>
        )}
      </form>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CompanySettings;