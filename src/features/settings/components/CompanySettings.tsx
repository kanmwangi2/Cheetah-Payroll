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
import { Company, PayrollTaxSettings } from '../../../shared/types';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import { isCompanyAdminOrHigher } from '../../../shared/constants/app.constants';

interface CompanySettingsProps {
  companyId: string;
}
const CompanySettings: React.FC<CompanySettingsProps> = ({ companyId }) => {
  const { user } = useAuthContext();
  
  const getInputStyle = () => ({
    width: '100%',
    padding: '12px',
    border: '1px solid var(--color-input-border)',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: 'var(--color-input-bg)',
    color: 'var(--color-text-primary)'
  });
  
  const getLabelStyle = () => ({
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
    color: 'var(--color-text-primary)'
  });
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
    structure: {
      departments: [] as string[],
      paymentTypes: [] as string[],
      deductionTypes: [] as string[]
    },
    payrollTaxSettings: {
      paye: true,
      pension: true,
      maternity: true,
      cbhi: true,
      rama: true
    },
    settings: {
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

  // Edit and delete state management
  const [editingItem, setEditingItem] = useState<{
    type: 'departments' | 'paymentTypes' | 'deductionTypes';
    index: number;
    value: string;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'departments' | 'paymentTypes' | 'deductionTypes';
    index: number;
    item: string;
  } | null>(null);

  const tabs = [
    { id: 'general', label: 'General Information', icon: '🏢' },
    { id: 'structure', label: 'Structure', icon: '🏗️' },
    { id: 'security', label: 'Security & Access', icon: '🔒' },
    { id: 'backup', label: 'Backup & Audit', icon: '💾' }
  ];

  const sectors = [
    'Agriculture', 'Banking & Finance', 'Construction', 'Education', 'Energy',
    'Healthcare', 'Hospitality', 'ICT', 'Manufacturing', 'Mining',
    'Non-Profit', 'Real Estate', 'Retail', 'Services', 'Tourism',
    'Transportation', 'Other'
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
          structure: {
            departments: companyData.structure?.departments || ['HR', 'Finance', 'IT', 'Operations'],
            paymentTypes: companyData.structure?.paymentTypes || ['Basic Salary', 'Transport Allowance', 'Housing Allowance', 'Bonus', 'Commission'],
            deductionTypes: companyData.structure?.deductionTypes || ['Loan', 'Salary Advance', 'Equipment Purchase', 'Uniform Cost', 'Training Fee', 'Union Dues', 'Insurance Premium']
          },
          payrollTaxSettings: {
            paye: companyData.payrollTaxSettings?.paye ?? true,
            pension: companyData.payrollTaxSettings?.pension ?? true,
            maternity: companyData.payrollTaxSettings?.maternity ?? true,
            cbhi: companyData.payrollTaxSettings?.cbhi ?? true,
            rama: companyData.payrollTaxSettings?.rama ?? true
          },
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

  const handleStructureChange = (type: 'departments' | 'paymentTypes' | 'deductionTypes', items: string[]) => {
    setFormData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        [type]: items
      }
    }));
  };

  const handlePayrollTaxChange = (taxType: keyof PayrollTaxSettings, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      payrollTaxSettings: {
        ...prev.payrollTaxSettings,
        [taxType]: enabled
      }
    }));
  };

  const addStructureItem = (type: 'departments' | 'paymentTypes' | 'deductionTypes', item: string) => {
    if (item.trim() && !formData.structure[type].includes(item.trim())) {
      handleStructureChange(type, [...formData.structure[type], item.trim()]);
    }
  };

  const removeStructureItem = (type: 'departments' | 'paymentTypes' | 'deductionTypes', index: number) => {
    const newItems = formData.structure[type].filter((_, i) => i !== index);
    handleStructureChange(type, newItems);
  };

  // Edit functionality
  const startEditing = (type: 'departments' | 'paymentTypes' | 'deductionTypes', index: number) => {
    setEditingItem({
      type,
      index,
      value: formData.structure[type][index]
    });
  };

  const saveEdit = () => {
    if (!editingItem) {return;}
    
    const { type, index, value } = editingItem;
    const trimmedValue = value.trim();
    
    // Check if the new value is different and not empty
    if (trimmedValue && trimmedValue !== formData.structure[type][index]) {
      // Check if the new value already exists (avoid duplicates)
      const otherItems = formData.structure[type].filter((_, i) => i !== index);
      if (!otherItems.includes(trimmedValue)) {
        const newItems = [...formData.structure[type]];
        newItems[index] = trimmedValue;
        handleStructureChange(type, newItems);
      }
    }
    
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  // Delete confirmation functionality
  const confirmDelete = (type: 'departments' | 'paymentTypes' | 'deductionTypes', index: number) => {
    setDeleteConfirmation({
      type,
      index,
      item: formData.structure[type][index]
    });
  };

  const executeDelete = () => {
    if (!deleteConfirmation) {return;}
    
    const { type, index } = deleteConfirmation;
    removeStructureItem(type, index);
    setDeleteConfirmation(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid var(--color-border-primary)',
          borderTop: '4px solid var(--color-primary-500)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>Loading company settings...</p>
      </div>
    );
  }

  const isAdmin = user?.role && isCompanyAdminOrHigher(user.role);

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: 'var(--color-bg-primary)',
      color: 'var(--color-text-primary)',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Company Settings
        </h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Manage your company information and system preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation style-pills">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>
              Confirm Deletion
            </h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete <strong>"{deleteConfirmation.item}"</strong>?
            </p>
            <p style={{ margin: '0 0 24px 0', color: 'var(--color-warning-600)', fontSize: '0.9rem' }}>
              ⚠️ This action cannot be undone. Make sure this item is not being used by any staff members, payments, or deductions.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={cancelDelete}
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-error-500)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* General Information Tab */}
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={getLabelStyle()}>
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={getInputStyle()}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={getLabelStyle()}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={getInputStyle()}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={getLabelStyle()}>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={getInputStyle()}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={getLabelStyle()}>
                Tax ID / TIN
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                style={getInputStyle()}
                disabled={!isAdmin}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={getLabelStyle()}>
                Business Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                style={{...getInputStyle(), resize: 'vertical'}}
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label style={getLabelStyle()}>
                Business Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                style={getInputStyle()}
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

        {/* Structure Tab */}
        {activeTab === 'structure' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            {/* Departments */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Departments
              </h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Add new department..."
                  id="new-department"
                  style={{ ...getInputStyle(), flex: 1, marginBottom: 0 }}
                  disabled={!isAdmin}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      addStructureItem('departments', target.value);
                      target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('new-department') as HTMLInputElement;
                    addStructureItem('departments', input.value);
                    input.value = '';
                  }}
                  disabled={!isAdmin}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--color-primary-500)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isAdmin ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.structure.departments.map((dept, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '6px'
                  }}>
                    {editingItem && editingItem.type === 'departments' && editingItem.index === index ? (
                      // Edit mode
                      <>
                        <input
                          type="text"
                          value={editingItem.value}
                          onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveEdit();
                            } else if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          style={{
                            fontSize: '0.9rem',
                            padding: '4px 8px',
                            border: '1px solid var(--color-primary-500)',
                            borderRadius: '4px',
                            background: 'var(--color-input-bg)',
                            color: 'var(--color-text-primary)',
                            minWidth: '120px'
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={saveEdit}
                          style={{
                            background: 'var(--color-success-500)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            background: 'var(--color-error-500)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <span 
                          style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--color-text-primary)',
                            cursor: isAdmin ? 'pointer' : 'default'
                          }}
                          onClick={() => isAdmin && startEditing('departments', index)}
                          title={isAdmin ? 'Click to edit' : ''}
                        >
                          {dept}
                        </span>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing('departments', index)}
                              style={{
                                background: 'var(--color-primary-500)',
                                color: 'var(--color-text-inverse)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Edit"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete('departments', index)}
                              style={{
                                background: 'var(--color-error-500)',
                                color: 'var(--color-text-inverse)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Types */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Payment Types
              </h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Add new payment type..."
                  id="new-payment-type"
                  style={{ ...getInputStyle(), flex: 1, marginBottom: 0 }}
                  disabled={!isAdmin}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      addStructureItem('paymentTypes', target.value);
                      target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('new-payment-type') as HTMLInputElement;
                    addStructureItem('paymentTypes', input.value);
                    input.value = '';
                  }}
                  disabled={!isAdmin}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--color-primary-500)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isAdmin ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.structure.paymentTypes.map((type, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '6px'
                  }}>
                    {editingItem && editingItem.type === 'paymentTypes' && editingItem.index === index ? (
                      // Edit mode
                      <>
                        <input
                          type="text"
                          value={editingItem.value}
                          onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveEdit();
                            } else if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          style={{
                            fontSize: '0.9rem',
                            padding: '4px 8px',
                            border: '1px solid var(--color-primary-500)',
                            borderRadius: '4px',
                            background: 'var(--color-input-bg)',
                            color: 'var(--color-text-primary)',
                            minWidth: '120px'
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={saveEdit}
                          style={{
                            background: 'var(--color-success-500)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            background: 'var(--color-error-500)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <span 
                          style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--color-text-primary)',
                            cursor: isAdmin ? 'pointer' : 'default'
                          }}
                          onClick={() => isAdmin && startEditing('paymentTypes', index)}
                          title={isAdmin ? 'Click to edit' : ''}
                        >
                          {type}
                        </span>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing('paymentTypes', index)}
                              style={{
                                background: 'var(--color-primary-500)',
                                color: 'var(--color-text-inverse)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Edit"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete('paymentTypes', index)}
                              style={{
                                background: 'var(--color-error-500)',
                                color: 'var(--color-text-inverse)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Deduction Types */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Other Deduction Types
              </h4>
              <p style={{ 
                margin: '0 0 16px 0', 
                color: 'var(--color-text-secondary)', 
                fontSize: '0.85rem',
                fontStyle: 'italic'
              }}>
                Note: Taxes (PAYE, Pension, Maternity, CBHI, RAMA) are managed globally through Tax Configuration and should not be added here.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Add new deduction type..."
                  id="new-deduction-type"
                  style={{ ...getInputStyle(), flex: 1, marginBottom: 0 }}
                  disabled={!isAdmin}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      addStructureItem('deductionTypes', target.value);
                      target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('new-deduction-type') as HTMLInputElement;
                    addStructureItem('deductionTypes', input.value);
                    input.value = '';
                  }}
                  disabled={!isAdmin}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--color-primary-500)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isAdmin ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.structure.deductionTypes.map((type, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '6px'
                  }}>
                    {editingItem && editingItem.type === 'deductionTypes' && editingItem.index === index ? (
                      // Edit mode
                      <>
                        <input
                          type="text"
                          value={editingItem.value}
                          onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveEdit();
                            } else if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          style={{
                            fontSize: '0.9rem',
                            padding: '4px 8px',
                            border: '1px solid var(--color-primary-500)',
                            borderRadius: '4px',
                            background: 'var(--color-input-bg)',
                            color: 'var(--color-text-primary)',
                            minWidth: '120px'
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={saveEdit}
                          style={{
                            background: 'var(--color-success-500)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            background: 'var(--color-error-500)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <span 
                          style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--color-text-primary)',
                            cursor: isAdmin ? 'pointer' : 'default'
                          }}
                          onClick={() => isAdmin && startEditing('deductionTypes', index)}
                          title={isAdmin ? 'Click to edit' : ''}
                        >
                          {type}
                        </span>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing('deductionTypes', index)}
                              style={{
                                background: 'var(--color-primary-500)',
                                color: 'var(--color-text-inverse)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Edit"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete('deductionTypes', index)}
                              style={{
                                background: 'var(--color-error-500)',
                                color: 'var(--color-text-inverse)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Exemptions Section */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Tax Exemptions
              </h4>
              <p style={{ 
                color: 'var(--color-text-secondary)', 
                fontSize: '0.9rem', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                Configure which taxes apply to this company. Global tax rates are managed in Tax Configuration, 
                but companies may be exempted from certain taxes. Disabled taxes will not be calculated during payroll processing.
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                padding: '20px'
              }}>
                {Object.entries({
                  paye: 'PAYE (Pay As You Earn)',
                  pension: 'Pension Contribution',
                  maternity: 'Maternity Insurance',
                  cbhi: 'Community Health Insurance (CBHI)',
                  rama: 'Rwanda Medical Insurance (RAMA)'
                }).map(([key, label]) => (
                  <div key={key} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px',
                    background: formData.payrollTaxSettings[key as keyof PayrollTaxSettings] 
                      ? 'var(--color-success-bg)' 
                      : 'var(--color-warning-bg)',
                    border: `1px solid ${formData.payrollTaxSettings[key as keyof PayrollTaxSettings] 
                      ? 'var(--color-success-border)' 
                      : 'var(--color-warning-border)'}`,
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      id={`tax-${key}`}
                      checked={formData.payrollTaxSettings[key as keyof PayrollTaxSettings]}
                      onChange={(e) => handlePayrollTaxChange(key as keyof PayrollTaxSettings, e.target.checked)}
                      disabled={!isAdmin}
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        cursor: isAdmin ? 'pointer' : 'not-allowed'
                      }}
                    />
                    <label 
                      htmlFor={`tax-${key}`}
                      style={{
                        fontWeight: 500,
                        color: formData.payrollTaxSettings[key as keyof PayrollTaxSettings] 
                          ? 'var(--color-success-text)' 
                          : 'var(--color-warning-text)',
                        cursor: isAdmin ? 'pointer' : 'not-allowed',
                        fontSize: '0.9rem',
                        flex: 1
                      }}
                    >
                      {label}
                    </label>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: formData.payrollTaxSettings[key as keyof PayrollTaxSettings] 
                        ? 'var(--color-success-text)' 
                        : 'var(--color-warning-text)'
                    }}>
                      {formData.payrollTaxSettings[key as keyof PayrollTaxSettings] ? 'ENABLED' : 'DISABLED'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'var(--color-info-bg)',
                border: '1px solid var(--color-info-border)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'var(--color-info-text)'
              }}>
                <strong>📋 Important:</strong> Tax exemptions require proper documentation and regulatory approval. 
                Ensure your company has the legal authority to disable specific taxes before making changes.
              </div>
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
              <label htmlFor="requirePayrollApproval" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Require Payroll Approval Workflow
              </label>
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Password Policy
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={getLabelStyle()}>
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="32"
                    value={formData.settings.passwordPolicy.minLength}
                    onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                    style={getInputStyle()}
                    disabled={!isAdmin}
                  />
                </div>

                <div>
                  <label style={getLabelStyle()}>
                    Password Max Age (days)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={formData.settings.passwordPolicy.maxAge}
                    onChange={(e) => handlePasswordPolicyChange('maxAge', parseInt(e.target.value))}
                    style={getInputStyle()}
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
                      <label htmlFor={policy.key} style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
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
              <label htmlFor="enableAuditTrail" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Enable Audit Trail Logging
              </label>
            </div>

            <div>
              <label style={getLabelStyle()}>
                Automatic Backup Frequency
              </label>
              <select
                value={formData.settings.backupFrequency}
                onChange={(e) => handleSettingsChange('backupFrequency', e.target.value)}
                style={{...getInputStyle(), width: '300px'}}
                disabled={!isAdmin}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Data Retention Information
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
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
            borderTop: '1px solid var(--color-border-primary)',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px',
                background: saving ? 'var(--color-neutral-500)' : 'var(--color-primary-500)',
                color: 'var(--color-text-inverse)',
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
                    borderTop: '2px solid var(--color-text-inverse)',
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
            background: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: '8px',
            color: 'var(--color-warning-text)',
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