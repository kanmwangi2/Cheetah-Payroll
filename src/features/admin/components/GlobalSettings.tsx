import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../core/config/firebase.config';

interface GlobalSettingsData {
  application: {
    name: string;
    version: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
    defaultTheme: 'light' | 'dark' | 'system';
    logoUrl?: string;
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
  const [settings, setSettings] = useState<GlobalSettingsData>({
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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    try {
      const docRef = doc(db, 'app_settings', 'global_settings');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalSettingsData;
        setSettings(data);
      } else {
        // Initialize with default configuration if document doesn't exist
        await setDoc(docRef, settings);
        setMessage({ type: 'success', text: 'Global settings initialized with default values' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      // console.error('Error loading global settings:', error);
      setMessage({ type: 'error', text: 'Failed to load global settings. Please check your permissions.' });
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
      // console.error('Error saving global settings:', error);
      setMessage({ type: 'error', text: 'Failed to save global settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof Omit<GlobalSettingsData, 'updatedAt'>, field: string, value: unknown) => {
    setSettings({
      ...settings,
      [section]: { ...settings[section], [field]: value }
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) { return; }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo file size must be less than 2MB' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();
      const logoRef = ref(storage, `logos/${Date.now()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(logoRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update settings with new logo URL
      updateSetting('application', 'logoUrl', downloadURL);
      
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    updateSetting('application', 'logoUrl', '');
    setMessage({ type: 'success', text: 'Logo removed successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 'var(--spacing-4xl)' }}>Loading global settings...</div>;
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-2xl)'
      }}>
        <h2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Global Application Settings</h2>
        <button
          onClick={saveGlobalSettings}
          disabled={saving}
          style={{
            padding: 'var(--spacing-md) var(--spacing-xl)',
            borderRadius: 'var(--border-radius-md)',
            border: 'none',
            background: saving ? 'var(--color-button-secondary)' : 'var(--color-button-primary)',
            color: 'var(--color-text-inverse)',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: 'var(--spacing-md) var(--spacing-lg)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--spacing-2xl)',
          background: message.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
          color: message.type === 'success' ? 'var(--color-success-text)' : 'var(--color-error-text)',
          border: `1px solid ${message.type === 'success' ? 'var(--color-success-border)' : 'var(--color-error-border)'}`
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: 'var(--spacing-3xl)' }}>
        {/* Application Settings */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-2xl)'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--color-text-primary)' }}>Application Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Application Name
              </label>
              <input
                type="text"
                value={settings.application.name}
                onChange={(e) => updateSetting('application', 'name', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Version
              </label>
              <input
                type="text"
                value={settings.application.version}
                onChange={(e) => updateSetting('application', 'version', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Support Email
              </label>
              <input
                type="email"
                value={settings.application.supportEmail}
                onChange={(e) => updateSetting('application', 'supportEmail', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Support Phone
              </label>
              <input
                type="tel"
                value={settings.application.supportPhone}
                onChange={(e) => updateSetting('application', 'supportPhone', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Default Theme
              </label>
              <select
                value={settings.application.defaultTheme}
                onChange={(e) => updateSetting('application', 'defaultTheme', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.application.maintenanceMode}
                onChange={(e) => updateSetting('application', 'maintenanceMode', e.target.checked)}
              />
              <label htmlFor="maintenanceMode" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Maintenance Mode
              </label>
            </div>
          </div>
          
          {/* Logo Upload Section */}
          <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)', borderTop: '1px solid var(--color-border-primary)' }}>
            <h4 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-md)' }}>
              Application Logo
            </h4>
            
            {/* Current Logo Preview */}
            {settings.application.logoUrl && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}>
                  <img 
                    src={settings.application.logoUrl} 
                    alt="Current Logo" 
                    style={{ 
                      width: '64px', 
                      height: '64px', 
                      objectFit: 'contain',
                      borderRadius: 'var(--border-radius-sm)'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      Current Logo
                    </p>
                    <button
                      onClick={removeLogo}
                      style={{
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        fontSize: 'var(--font-size-xs)',
                        border: '1px solid var(--color-error-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-error-text)',
                        cursor: 'pointer'
                      }}
                    >
                      Remove Logo
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Logo Upload Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Upload New Logo
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  style={{
                    padding: 'var(--spacing-sm)',
                    border: '1px solid var(--color-input-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    backgroundColor: uploading ? 'var(--color-input-disabled)' : 'var(--color-input-bg)',
                    color: 'var(--color-text-primary)',
                    cursor: uploading ? 'not-allowed' : 'pointer'
                  }}
                />
                {uploading && (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Uploading...
                  </span>
                )}
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--color-text-secondary)' 
              }}>
                Supported formats: PNG, JPG, SVG. Maximum size: 2MB. Recommended dimensions: 200x200px.
              </p>
            </div>
          </div>
        </div>

        {/* Payroll Settings */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-2xl)'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--color-text-primary)' }}>Payroll Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Default Pay Period
              </label>
              <select
                value={settings.payroll.defaultPayPeriod}
                onChange={(e) => updateSetting('payroll', 'defaultPayPeriod', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Backup Frequency
              </label>
              <select
                value={settings.payroll.backupFrequency}
                onChange={(e) => updateSetting('payroll', 'backupFrequency', e.target.value)}
                disabled={!settings.payroll.autoBackup}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: !settings.payroll.autoBackup ? 'var(--color-input-disabled)' : 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="allowFuturePayrolls"
                  checked={settings.payroll.allowFuturePayrolls}
                  onChange={(e) => updateSetting('payroll', 'allowFuturePayrolls', e.target.checked)}
                />
                <label htmlFor="allowFuturePayrolls" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Allow Future Payrolls
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={settings.payroll.requireApproval}
                  onChange={(e) => updateSetting('payroll', 'requireApproval', e.target.checked)}
                />
                <label htmlFor="requireApproval" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Require Payroll Approval
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="autoBackup"
                  checked={settings.payroll.autoBackup}
                  onChange={(e) => updateSetting('payroll', 'autoBackup', e.target.checked)}
                />
                <label htmlFor="autoBackup" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Automatic Backup
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-2xl)'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--color-text-primary)' }}>Security Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="requireMFA"
                  checked={settings.security.requireMFA}
                  onChange={(e) => updateSetting('security', 'requireMFA', e.target.checked)}
                />
                <label htmlFor="requireMFA" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Require Multi-Factor Authentication
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="allowMultipleSessions"
                  checked={settings.security.allowMultipleSessions}
                  onChange={(e) => updateSetting('security', 'allowMultipleSessions', e.target.checked)}
                />
                <label htmlFor="allowMultipleSessions" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Allow Multiple Sessions
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-2xl)'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--color-text-primary)' }}>Notification Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                />
                <label htmlFor="emailNotifications" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Email Notifications
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="payrollReminders"
                  checked={settings.notifications.payrollReminders}
                  onChange={(e) => updateSetting('notifications', 'payrollReminders', e.target.checked)}
                />
                <label htmlFor="payrollReminders" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Payroll Reminders
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="systemAlerts"
                  checked={settings.notifications.systemAlerts}
                  onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                />
                <label htmlFor="systemAlerts" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  System Alerts
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <input
                  type="checkbox"
                  id="auditNotifications"
                  checked={settings.notifications.auditNotifications}
                  onChange={(e) => updateSetting('notifications', 'auditNotifications', e.target.checked)}
                />
                <label htmlFor="auditNotifications" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Audit Notifications
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-2xl)'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--color-text-primary)' }}>Integration Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                id="bankingAPI"
                checked={settings.integrations.bankingAPI}
                onChange={(e) => updateSetting('integrations', 'bankingAPI', e.target.checked)}
              />
              <label htmlFor="bankingAPI" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Banking API Integration
              </label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                id="hrSystemAPI"
                checked={settings.integrations.hrSystemAPI}
                onChange={(e) => updateSetting('integrations', 'hrSystemAPI', e.target.checked)}
              />
              <label htmlFor="hrSystemAPI" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                HR System API Integration
              </label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                id="accountingAPI"
                checked={settings.integrations.accountingAPI}
                onChange={(e) => updateSetting('integrations', 'accountingAPI', e.target.checked)}
              />
              <label htmlFor="accountingAPI" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Accounting API Integration
              </label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                id="reportsAPI"
                checked={settings.integrations.reportsAPI}
                onChange={(e) => updateSetting('integrations', 'reportsAPI', e.target.checked)}
              />
              <label htmlFor="reportsAPI" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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