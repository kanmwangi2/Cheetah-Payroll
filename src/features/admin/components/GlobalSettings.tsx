import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';

interface GlobalSettings {
  application: {
    name: string;
    version: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
    defaultTheme: 'light' | 'dark' | 'system';
  };
  payroll: {
    defaultPayPeriod: 'monthly' | 'weekly' | 'bi-weekly';
    allowFuturePayrolls: boolean;
    requireApproval: boolean;
    maxPayrollRetention: number; // months
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  security: {
    sessionTimeout: number; // minutes
    passwordMinLength: number;
    requireMFA: boolean;
    allowMultipleSessions: boolean;
    loginAttemptLimit: number;
    lockoutDuration: number; // minutes
  };
  notifications: {
    emailNotifications: boolean;
    payrollReminders: boolean;
    systemAlerts: boolean;
    auditNotifications: boolean;
    reminderDaysBefore: number;
  };
  integrations: {
    bankingAPI: boolean;
    hrSystemAPI: boolean;
    accountingAPI: boolean;
    reportsAPI: boolean;
  };
  updatedAt: Date;
}

const GlobalSettings: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings>({
    application: {
      name: 'Cheetah Payroll',
      version: '1.0.0',
      supportEmail: 'support@cheetahpayroll.com',
      supportPhone: '+250 788 123 456',
      maintenanceMode: false,
      defaultTheme: 'system'
    },
    payroll: {
      defaultPayPeriod: 'monthly',
      allowFuturePayrolls: true,
      requireApproval: true,
      maxPayrollRetention: 36,
      autoBackup: true,
      backupFrequency: 'daily'
    },
    security: {
      sessionTimeout: 480, // 8 hours
      passwordMinLength: 8,
      requireMFA: false,
      allowMultipleSessions: true,
      loginAttemptLimit: 5,
      lockoutDuration: 30
    },
    notifications: {
      emailNotifications: true,
      payrollReminders: true,
      systemAlerts: true,
      auditNotifications: true,
      reminderDaysBefore: 3
    },
    integrations: {
      bankingAPI: false,
      hrSystemAPI: false,
      accountingAPI: false,
      reportsAPI: false
    },
    updatedAt: new Date()
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    try {
      const docRef = doc(db, 'app_settings', 'global_settings');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalSettings;
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading global settings:', error);
      setMessage({ type: 'error', text: 'Failed to load global settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveGlobalSettings = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'app_settings', 'global_settings');
      const updatedSettings = {
        ...settings,
        updatedAt: new Date()
      };
      
      await setDoc(docRef, updatedSettings);
      setSettings(updatedSettings);
      setMessage({ type: 'success', text: 'Global settings saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving global settings:', error);
      setMessage({ type: 'error', text: 'Failed to save global settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof Omit<GlobalSettings, 'updatedAt'>, field: string, value: any) => {
    setSettings({
      ...settings,
      [section]: { ...settings[section], [field]: value }
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading global settings...</div>;
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>Global Application Settings</h2>
        <button
          onClick={saveGlobalSettings}
          disabled={saving}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            background: saving ? '#ccc' : '#1976d2',
            color: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 500
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 6,
          marginBottom: '24px',
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Application Settings */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Application Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Application Name
              </label>
              <input
                type="text"
                value={settings.application.name}
                onChange={(e) => updateSetting('application', 'name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Version
              </label>
              <input
                type="text"
                value={settings.application.version}
                onChange={(e) => updateSetting('application', 'version', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Support Email
              </label>
              <input
                type="email"
                value={settings.application.supportEmail}
                onChange={(e) => updateSetting('application', 'supportEmail', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Support Phone
              </label>
              <input
                type="tel"
                value={settings.application.supportPhone}
                onChange={(e) => updateSetting('application', 'supportPhone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Default Theme
              </label>
              <select
                value={settings.application.defaultTheme}
                onChange={(e) => updateSetting('application', 'defaultTheme', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.application.maintenanceMode}
                onChange={(e) => updateSetting('application', 'maintenanceMode', e.target.checked)}
              />
              <label htmlFor="maintenanceMode" style={{ fontSize: '14px', fontWeight: 500 }}>
                Maintenance Mode
              </label>
            </div>
          </div>
        </div>

        {/* Payroll Settings */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Payroll Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Default Pay Period
              </label>
              <select
                value={settings.payroll.defaultPayPeriod}
                onChange={(e) => updateSetting('payroll', 'defaultPayPeriod', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Payroll Retention (Months)
              </label>
              <input
                type="number"
                min="12"
                max="120"
                value={settings.payroll.maxPayrollRetention}
                onChange={(e) => updateSetting('payroll', 'maxPayrollRetention', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Backup Frequency
              </label>
              <select
                value={settings.payroll.backupFrequency}
                onChange={(e) => updateSetting('payroll', 'backupFrequency', e.target.value)}
                disabled={!settings.payroll.autoBackup}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px',
                  backgroundColor: !settings.payroll.autoBackup ? '#e9ecef' : '#fff'
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="allowFuturePayrolls"
                  checked={settings.payroll.allowFuturePayrolls}
                  onChange={(e) => updateSetting('payroll', 'allowFuturePayrolls', e.target.checked)}
                />
                <label htmlFor="allowFuturePayrolls" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Allow Future Payrolls
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={settings.payroll.requireApproval}
                  onChange={(e) => updateSetting('payroll', 'requireApproval', e.target.checked)}
                />
                <label htmlFor="requireApproval" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Require Payroll Approval
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="autoBackup"
                  checked={settings.payroll.autoBackup}
                  onChange={(e) => updateSetting('payroll', 'autoBackup', e.target.checked)}
                />
                <label htmlFor="autoBackup" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Automatic Backup
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Security Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="1440"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="50"
                value={settings.security.passwordMinLength}
                onChange={(e) => updateSetting('security', 'passwordMinLength', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Login Attempt Limit
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.security.loginAttemptLimit}
                onChange={(e) => updateSetting('security', 'loginAttemptLimit', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.security.lockoutDuration}
                onChange={(e) => updateSetting('security', 'lockoutDuration', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="requireMFA"
                  checked={settings.security.requireMFA}
                  onChange={(e) => updateSetting('security', 'requireMFA', e.target.checked)}
                />
                <label htmlFor="requireMFA" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Require Multi-Factor Authentication
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="allowMultipleSessions"
                  checked={settings.security.allowMultipleSessions}
                  onChange={(e) => updateSetting('security', 'allowMultipleSessions', e.target.checked)}
                />
                <label htmlFor="allowMultipleSessions" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Allow Multiple Sessions
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Notification Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                Reminder Days Before Payroll
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.notifications.reminderDaysBefore}
                onChange={(e) => updateSetting('notifications', 'reminderDaysBefore', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                />
                <label htmlFor="emailNotifications" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Email Notifications
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="payrollReminders"
                  checked={settings.notifications.payrollReminders}
                  onChange={(e) => updateSetting('notifications', 'payrollReminders', e.target.checked)}
                />
                <label htmlFor="payrollReminders" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Payroll Reminders
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="systemAlerts"
                  checked={settings.notifications.systemAlerts}
                  onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                />
                <label htmlFor="systemAlerts" style={{ fontSize: '14px', fontWeight: 500 }}>
                  System Alerts
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="auditNotifications"
                  checked={settings.notifications.auditNotifications}
                  onChange={(e) => updateSetting('notifications', 'auditNotifications', e.target.checked)}
                />
                <label htmlFor="auditNotifications" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Audit Notifications
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Integration Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="bankingAPI"
                checked={settings.integrations.bankingAPI}
                onChange={(e) => updateSetting('integrations', 'bankingAPI', e.target.checked)}
              />
              <label htmlFor="bankingAPI" style={{ fontSize: '14px', fontWeight: 500 }}>
                Banking API Integration
              </label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="hrSystemAPI"
                checked={settings.integrations.hrSystemAPI}
                onChange={(e) => updateSetting('integrations', 'hrSystemAPI', e.target.checked)}
              />
              <label htmlFor="hrSystemAPI" style={{ fontSize: '14px', fontWeight: 500 }}>
                HR System API Integration
              </label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="accountingAPI"
                checked={settings.integrations.accountingAPI}
                onChange={(e) => updateSetting('integrations', 'accountingAPI', e.target.checked)}
              />
              <label htmlFor="accountingAPI" style={{ fontSize: '14px', fontWeight: 500 }}>
                Accounting API Integration
              </label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="reportsAPI"
                checked={settings.integrations.reportsAPI}
                onChange={(e) => updateSetting('integrations', 'reportsAPI', e.target.checked)}
              />
              <label htmlFor="reportsAPI" style={{ fontSize: '14px', fontWeight: 500 }}>
                Reports API Integration
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;