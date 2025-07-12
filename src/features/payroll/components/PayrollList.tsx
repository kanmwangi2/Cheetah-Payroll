import React, { useEffect, useState } from 'react';
import PDFExport from '../../reports/components/PDFExport';
import ApprovalWorkflow from '../../../shared/components/ApprovalWorkflow';
import { getPayrolls, createPayroll, calculatePayroll } from '../services/payroll.service';

const defaultBrackets = [
  { min: 0, max: 60000, rate: 0 },
  { min: 60001, max: 100000, rate: 10 },
  { min: 100001, max: 200000, rate: 20 },
  { min: 200001, max: null, rate: 30 },
];
const defaultPension = { employee: 6, employer: 8 };
const defaultMaternity = { employee: 0.3, employer: 0.3 };
const defaultCBHI = { employee: 0.5, employer: 0 };
const defaultRAMA = { employee: 7.5, employer: 7.5 };

const PayrollList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState<any>({
    gross: '',
    basic: '',
    transport: '',
    otherDeductions: '',
  });
  const [result, setResult] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [search, setSearch] = useState('');
  const [showCalculationForm, setShowCalculationForm] = useState(false);

  useEffect(() => {
    getPayrolls(companyId)
      .then(setPayrolls)
      .catch(e => setError(e.message || 'Failed to load payrolls'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      const { [field]: omit, ...rest } = prev;
      return rest;
    });
  };

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.gross || isNaN(Number(form.gross)) || Number(form.gross) <= 0)
      {errs.gross = 'Gross must be positive number';}
    if (!form.basic || isNaN(Number(form.basic)) || Number(form.basic) < 0)
      {errs.basic = 'Basic must be non-negative number';}
    if (form.transport && (isNaN(Number(form.transport)) || Number(form.transport) < 0))
      {errs.transport = 'Transport must be non-negative number';}
    if (
      form.otherDeductions &&
      (isNaN(Number(form.otherDeductions)) || Number(form.otherDeductions) < 0)
    )
      {errs.otherDeductions = 'Other deductions must be non-negative number';}
    return errs;
  };

  const handleCalculate = () => {
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {return;}
    const gross = parseFloat(form.gross);
    const basic = parseFloat(form.basic);
    const transport = parseFloat(form.transport) || 0;
    const otherDeductions = parseFloat(form.otherDeductions) || 0;
    const result = calculatePayroll({
      gross,
      basic,
      transport,
      brackets: defaultBrackets,
      pensionRates: defaultPension,
      maternityRates: defaultMaternity,
      cbhiRates: defaultCBHI,
      ramaRates: defaultRAMA,
      otherDeductions,
    });
    setResult(result);
  };

  const handleCreate = async () => {
    try {
      await createPayroll(companyId, { ...form, ...result });
      setRefresh(r => r + 1);
      setForm({ gross: '', basic: '', transport: '', otherDeductions: '' });
      setResult(null);
      setShowCalculationForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create payroll');
    }
  };

  if (loading) {return <div className="payroll-loading" aria-live="polite">Loading payrolls...</div>;}
  if (error)
    {return (
      <div className="payroll-error" role="alert" aria-live="assertive">
        {error}
      </div>
    );}

  const filtered = payrolls.filter(p => {
    return !search || String(p.gross).includes(search) || String(p.finalNet).includes(search);
  });

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#333',
          fontSize: '2rem',
          fontWeight: 600
        }}>
          Payroll Management
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  console.log('Import CSV:', file);
                }
              };
              input.click();
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid #28a745',
              background: '#fff',
              color: '#28a745',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            📤 Import CSV
          </button>
          <button
            onClick={() => {
              const csvContent = 'gross,finalNet,paye\n' + 
                payrolls.map(p => `${p.gross},${p.finalNet},${p.paye}`).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'payroll_export.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid #17a2b8',
              background: '#fff',
              color: '#17a2b8',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => {
              const template = 'gross,basic,transport,otherDeductions\n500000,400000,50000,0';
              const blob = new Blob([template], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'payroll_import_template.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid #6c757d',
              background: '#fff',
              color: '#6c757d',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            📋 Template
          </button>
          <button
            onClick={() => setShowCalculationForm(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: '#1976d2',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            + Calculate Payroll
          </button>
        </div>
      </div>

      {/* PDF Export and Approval Workflow */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <PDFExport data={payrolls} type="payroll" />
        <ApprovalWorkflow payrollId={payrolls[0]?.id || ''} companyId={companyId} />
      </div>

      {/* Search and Filters */}
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: '#333'
            }}>
              Search Payrolls
            </label>
            <input
              type="search"
              placeholder="Search by gross or net..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          fontSize: '14px', 
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Showing {filtered.length} of {payrolls.length} payrolls</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid #ddd',
                background: '#fff',
                color: '#666',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Payroll Table */}
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {filtered.length === 0 ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: '#666'
          }}>
            {payrolls.length === 0 ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No payrolls yet</h3>
                <p style={{ margin: '0' }}>Get started by calculating your first payroll.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No payrolls found</h3>
                <p style={{ margin: '0' }}>Try adjusting your search criteria.</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Gross
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Net
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    PAYE
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Pension (Emp/Er)
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Maternity (Emp/Er)
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    RAMA (Emp/Er)
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    CBHI
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: '#333' }}>
                      RWF {p.gross?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: '#28a745' }}>
                      RWF {p.finalNet?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: '#333' }}>
                      RWF {p.paye?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#333' }}>
                      {p.pensionEmployee} / {p.pensionEmployer}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#333' }}>
                      {p.maternityEmployee} / {p.maternityEmployer}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#333' }}>
                      {p.ramaEmployee} / {p.ramaEmployer}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: '#333' }}>
                      RWF {p.cbhiEmployee?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Calculation Form Modal */}
      {showCalculationForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            padding: '24px'
          }}>
            <button
              onClick={() => {
                setShowCalculationForm(false);
                setResult(null);
                setForm({ gross: '', basic: '', transport: '', otherDeductions: '' });
                setFieldErrors({});
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1001,
                color: '#666'
              }}
            >
              ×
            </button>
            
            <h3 style={{ margin: '0 0 24px 0', color: '#333' }}>Calculate Payroll</h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 500,
                  color: '#333'
                }}>
                  Gross Pay *
                </label>
                <input
                  className={fieldErrors.gross ? 'error' : ''}
                  placeholder="Enter gross pay amount"
                  value={form.gross}
                  onChange={e => handleChange('gross', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: fieldErrors.gross ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                />
                {fieldErrors.gross && (
                  <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.gross}
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 500,
                  color: '#333'
                }}>
                  Basic Pay *
                </label>
                <input
                  className={fieldErrors.basic ? 'error' : ''}
                  placeholder="Enter basic pay amount"
                  value={form.basic}
                  onChange={e => handleChange('basic', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: fieldErrors.basic ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                />
                {fieldErrors.basic && (
                  <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.basic}
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 500,
                  color: '#333'
                }}>
                  Transport Allowance
                </label>
                <input
                  className={fieldErrors.transport ? 'error' : ''}
                  placeholder="Enter transport allowance (optional)"
                  value={form.transport}
                  onChange={e => handleChange('transport', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: fieldErrors.transport ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                />
                {fieldErrors.transport && (
                  <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.transport}
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 500,
                  color: '#333'
                }}>
                  Other Deductions
                </label>
                <input
                  className={fieldErrors.otherDeductions ? 'error' : ''}
                  placeholder="Enter other deductions (optional)"
                  value={form.otherDeductions}
                  onChange={e => handleChange('otherDeductions', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: fieldErrors.otherDeductions ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                />
                {fieldErrors.otherDeductions && (
                  <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.otherDeductions}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCalculate}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 4,
                    border: 'none',
                    background: '#007bff',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Calculate
                </button>
              </div>

              {error && (
                <div style={{ 
                  background: '#f8d7da', 
                  color: '#721c24', 
                  padding: '12px', 
                  borderRadius: 4,
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {result && (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: 4,
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Calculation Result</h4>
                  <div style={{ 
                    background: '#fff', 
                    padding: '12px', 
                    borderRadius: 4, 
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    marginBottom: '16px',
                    border: '1px solid #e9ecef'
                  }}>
                    {JSON.stringify(result, null, 2)}
                  </div>
                  <button 
                    onClick={handleCreate}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 4,
                      border: 'none',
                      background: '#28a745',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Save Payroll
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollList;
