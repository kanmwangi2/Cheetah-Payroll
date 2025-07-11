import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

interface TaxRates {
  employee: number;
  employer: number;
}

interface TaxConfiguration {
  paye_brackets: TaxBracket[];
  pension_rates: TaxRates;
  maternity_rates: TaxRates;
  cbhi_rates: TaxRates;
  rama_rates: TaxRates;
  updatedAt: Date;
}

const TaxConfiguration: React.FC = () => {
  const [config, setConfig] = useState<TaxConfiguration>({
    paye_brackets: [
      { min: 0, max: 60000, rate: 0 },
      { min: 60001, max: 100000, rate: 10 },
      { min: 100001, max: 200000, rate: 20 },
      { min: 200001, max: null, rate: 30 }
    ],
    pension_rates: { employee: 6, employer: 8 },
    maternity_rates: { employee: 0.3, employer: 0.3 },
    cbhi_rates: { employee: 0.5, employer: 0 },
    rama_rates: { employee: 7.5, employer: 7.5 },
    updatedAt: new Date()
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadTaxConfiguration();
  }, []);

  const loadTaxConfiguration = async () => {
    try {
      const docRef = doc(db, 'app_settings', 'tax_brackets');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as TaxConfiguration;
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading tax configuration:', error);
      setMessage({ type: 'error', text: 'Failed to load tax configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveTaxConfiguration = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'app_settings', 'tax_brackets');
      const updatedConfig = {
        ...config,
        updatedAt: new Date()
      };
      
      await setDoc(docRef, updatedConfig);
      setConfig(updatedConfig);
      setMessage({ type: 'success', text: 'Tax configuration saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving tax configuration:', error);
      setMessage({ type: 'error', text: 'Failed to save tax configuration' });
    } finally {
      setSaving(false);
    }
  };

  const updatePayeBracket = (index: number, field: keyof TaxBracket, value: number | null) => {
    const newBrackets = [...config.paye_brackets];
    newBrackets[index] = { ...newBrackets[index], [field]: value };
    setConfig({ ...config, paye_brackets: newBrackets });
  };

  const addPayeBracket = () => {
    const lastBracket = config.paye_brackets[config.paye_brackets.length - 1];
    const newBracket: TaxBracket = {
      min: (lastBracket.max || 0) + 1,
      max: null,
      rate: 0
    };
    
    // Update the last bracket's max to the new bracket's min - 1
    const updatedBrackets = [...config.paye_brackets];
    updatedBrackets[updatedBrackets.length - 1] = {
      ...lastBracket,
      max: newBracket.min - 1
    };
    updatedBrackets.push(newBracket);
    
    setConfig({ ...config, paye_brackets: updatedBrackets });
  };

  const removePayeBracket = (index: number) => {
    if (config.paye_brackets.length <= 1) {return;}
    
    const newBrackets = config.paye_brackets.filter((_, i) => i !== index);
    // Set the last bracket's max to null
    if (newBrackets.length > 0) {
      newBrackets[newBrackets.length - 1].max = null;
    }
    
    setConfig({ ...config, paye_brackets: newBrackets });
  };

  const updateTaxRate = (type: keyof Omit<TaxConfiguration, 'paye_brackets' | 'updatedAt'>, field: keyof TaxRates, value: number) => {
    setConfig({
      ...config,
      [type]: { ...config[type], [field]: value }
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading tax configuration...</div>;
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>Tax Configuration</h2>
        <button
          onClick={saveTaxConfiguration}
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
          {saving ? 'Saving...' : 'Save Configuration'}
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
        {/* PAYE Tax Brackets */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: 0, color: '#333' }}>PAYE Tax Brackets</h3>
            <button
              onClick={addPayeBracket}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #28a745',
                background: '#fff',
                color: '#28a745',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              + Add Bracket
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {config.paye_brackets.map((bracket, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr auto',
                gap: '12px',
                alignItems: 'center',
                padding: '12px',
                background: '#fff',
                borderRadius: 4,
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                    Minimum (RWF)
                  </label>
                  <input
                    type="number"
                    value={bracket.min}
                    onChange={(e) => updatePayeBracket(index, 'min', Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                    Maximum (RWF)
                  </label>
                  <input
                    type="number"
                    value={bracket.max || ''}
                    onChange={(e) => updatePayeBracket(index, 'max', e.target.value ? Number(e.target.value) : null)}
                    placeholder="No limit"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={bracket.rate}
                    onChange={(e) => updatePayeBracket(index, 'rate', Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <button
                  onClick={() => removePayeBracket(index)}
                  disabled={config.paye_brackets.length <= 1}
                  style={{
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #dc3545',
                    background: '#fff',
                    color: '#dc3545',
                    cursor: config.paye_brackets.length <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    opacity: config.paye_brackets.length <= 1 ? 0.5 : 1
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Contributions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Pension Rates */}
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: 8,
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Pension Contribution</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Employee Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.pension_rates.employee}
                  onChange={(e) => updateTaxRate('pension_rates', 'employee', Number(e.target.value))}
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
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Employer Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.pension_rates.employer}
                  onChange={(e) => updateTaxRate('pension_rates', 'employer', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Maternity Rates */}
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: 8,
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Maternity Contribution</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Employee Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.maternity_rates.employee}
                  onChange={(e) => updateTaxRate('maternity_rates', 'employee', Number(e.target.value))}
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
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Employer Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.maternity_rates.employer}
                  onChange={(e) => updateTaxRate('maternity_rates', 'employer', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* CBHI Rates */}
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: 8,
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>CBHI Contribution</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Employee Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.cbhi_rates.employee}
                  onChange={(e) => updateTaxRate('cbhi_rates', 'employee', Number(e.target.value))}
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
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Employer Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.cbhi_rates.employer}
                  onChange={(e) => updateTaxRate('cbhi_rates', 'employer', Number(e.target.value))}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px',
                    backgroundColor: '#e9ecef'
                  }}
                />
                <small style={{ color: '#6c757d' }}>CBHI is employee-only contribution</small>
              </div>
            </div>
          </div>

          {/* RAMA Rates */}
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: 8,
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>RAMA Contribution</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Employee Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.rama_rates.employee}
                  onChange={(e) => updateTaxRate('rama_rates', 'employee', Number(e.target.value))}
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
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Employer Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.rama_rates.employer}
                  onChange={(e) => updateTaxRate('rama_rates', 'employer', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <small style={{ color: '#6c757d' }}>RAMA calculated on basic pay only (excludes allowances)</small>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '32px',
        padding: '16px',
        background: '#e3f2fd',
        borderRadius: 8,
        border: '1px solid #bbdefb'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>Tax Calculation Sequence</h4>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#424242' }}>
          <li>Calculate PAYE on Total Gross Pay using progressive brackets</li>
          <li>Calculate Pension (Employee: {config.pension_rates.employee}%, Employer: {config.pension_rates.employer}%) on Total Gross Pay</li>
          <li>Calculate Maternity (Employee: {config.maternity_rates.employee}%, Employer: {config.maternity_rates.employer}%) on Total Gross Pay excluding transport</li>
          <li>Calculate RAMA (Employee: {config.rama_rates.employee}%, Employer: {config.rama_rates.employer}%) on Basic Pay only</li>
          <li>Calculate intermediate Net Salary (Gross - PAYE - Pension - Maternity - RAMA)</li>
          <li>Calculate CBHI ({config.cbhi_rates.employee}% employee) on intermediate Net Salary</li>
          <li>Calculate Final Net Pay (Net Salary - CBHI - Other Deductions)</li>
        </ol>
      </div>
    </div>
  );
};

export default TaxConfiguration;