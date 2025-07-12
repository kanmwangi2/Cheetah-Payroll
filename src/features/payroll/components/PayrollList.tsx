import React, { useEffect, useState } from 'react';
import { getPayrolls, createComprehensivePayroll } from '../services/payroll.service';
import { useAuthContext } from '../../../core/providers/AuthProvider';

const PayrollList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { user } = useAuthContext();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [payrollPeriod, setPayrollPeriod] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getPayrolls(companyId)
      .then(setPayrolls)
      .catch(e => setError(e.message || 'Failed to load payrolls'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  const handleCreatePayroll = async () => {
    if (!payrollPeriod.trim()) {
      setError('Please enter a payroll period (e.g., "2025-07" or "July 2025")');
      return;
    }

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setCreating(true);
    try {
      await createComprehensivePayroll(companyId, payrollPeriod, user.id);
      setRefresh(r => r + 1);
      setPayrollPeriod('');
      setShowPayrollForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create comprehensive payroll');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {return <div className="payroll-loading" aria-live="polite" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading payrolls...</div>;}
  if (error)
    {return (
      <div className="payroll-error" role="alert" aria-live="assertive" style={{ padding: '20px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error-text)', borderRadius: '8px', border: '1px solid var(--color-error-border)' }}>
        {error}
      </div>
    );}

  const filtered = payrolls.filter(p => {
    return !search || 
           (p.period && p.period.toLowerCase().includes(search.toLowerCase())) ||
           String(p.totalGrossPay || 0).includes(search) || 
           String(p.totalNetPay || 0).includes(search) ||
           (p.status && p.status.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: 'var(--color-text-primary)',
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
              border: '1px solid var(--color-success-500)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-success-600)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all var(--transition-normal)'
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
              border: '1px solid var(--color-info-500)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-info-600)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all var(--transition-normal)'
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
              border: '1px solid var(--color-neutral-500)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all var(--transition-normal)'
            }}
          >
            📋 Template
          </button>
          <button
            onClick={() => setShowPayrollForm(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--color-primary-600)',
              color: 'var(--color-text-inverse)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all var(--transition-normal)'
            }}
          >
            + Create Comprehensive Payroll
          </button>
        </div>
      </div>


      {/* Search and Filters */}
      <div style={{
        background: 'var(--color-card-bg)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid var(--color-border-primary)',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)',
        transition: 'all var(--transition-normal)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: 'var(--color-text-primary)'
            }}>
              Search Payrolls
            </label>
            <input
              type="search"
              placeholder="Search by period, status, amounts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-input-border)',
                borderRadius: 4,
                fontSize: '14px',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text-primary)',
                transition: 'all var(--transition-normal)'
              }}
            />
          </div>
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          fontSize: '14px', 
          color: 'var(--color-text-secondary)',
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
                border: '1px solid var(--color-border-primary)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all var(--transition-normal)'
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Payroll Table */}
      <div style={{
        background: 'var(--color-card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--color-border-primary)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        transition: 'all var(--transition-normal)'
      }}>
        {filtered.length === 0 ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            {payrolls.length === 0 ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No payrolls yet</h3>
                <p style={{ margin: '0' }}>Get started by calculating your first payroll.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No payrolls found</h3>
                <p style={{ margin: '0' }}>Try adjusting your search criteria.</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-tertiary)', borderBottom: '2px solid var(--color-border-primary)' }}>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Period
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Staff Count
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Total Gross Pay
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Total Net Pay
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Created Date
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const statusColor = p.status === 'completed' ? 'var(--color-success-600)' : 
                                     p.status === 'pending' ? 'var(--color-warning-600)' : 
                                     p.status === 'draft' ? 'var(--color-info-600)' : 'var(--color-text-secondary)';
                  
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
                      <td style={{ padding: '16px', textAlign: 'left', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {p.period || 'N/A'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ 
                          color: statusColor,
                          backgroundColor: statusColor + '20',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}>
                          {p.status || 'draft'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-primary)' }}>
                        {p.staffCount || 0}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        RWF {p.totalGrossPay?.toLocaleString() || '0'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: 'var(--color-success-600)' }}>
                        RWF {p.totalNetPay?.toLocaleString() || '0'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        {p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => console.log('View payroll:', p.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 4,
                              border: '1px solid var(--color-info-500)',
                              background: 'var(--color-bg-secondary)',
                              color: 'var(--color-info-600)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              transition: 'all var(--transition-normal)'
                            }}
                          >
                            View
                          </button>
                          {p.status !== 'completed' && (
                            <button
                              onClick={() => console.log('Edit payroll:', p.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 4,
                                border: '1px solid var(--color-warning-500)',
                                background: 'var(--color-bg-secondary)',
                                color: 'var(--color-warning-600)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'all var(--transition-normal)'
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payroll Creation Form Modal */}
      {showPayrollForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--color-overlay-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-modal-bg)',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            padding: '24px',
            border: '1px solid var(--color-border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button
              onClick={() => {
                setShowPayrollForm(false);
                setPayrollPeriod('');
                setError(null);
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
                color: 'var(--color-text-secondary)',
                transition: 'color var(--transition-normal)'
              }}
            >
              ×
            </button>
            
            <h3 style={{ 
              margin: '0 0 24px 0', 
              color: 'var(--color-text-primary)',
              fontSize: '1.5rem',
              fontWeight: 600
            }}>
              Create Comprehensive Payroll
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  fontSize: '14px'
                }}>
                  Payroll Period *
                </label>
                <input
                  type="text"
                  placeholder='Enter period (e.g., "2025-07" or "July 2025")'
                  value={payrollPeriod}
                  onChange={e => setPayrollPeriod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--color-input-border)',
                    borderRadius: 6,
                    fontSize: '14px',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-normal)',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary-500)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-primary-100)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-input-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--color-text-secondary)', 
                  marginTop: '6px',
                  lineHeight: '1.4'
                }}>
                  This will create a comprehensive payroll for all active staff members in the company for the specified period.
                </div>
              </div>

              {error && (
                <div style={{ 
                  background: 'var(--color-error-bg)', 
                  color: 'var(--color-error-text)', 
                  padding: '12px 16px', 
                  borderRadius: 6,
                  fontSize: '14px',
                  border: '1px solid var(--color-error-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  {error}
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                marginTop: '8px'
              }}>
                <button
                  onClick={() => {
                    setShowPayrollForm(false);
                    setPayrollPeriod('');
                    setError(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 6,
                    border: '1px solid var(--color-border-primary)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePayroll}
                  disabled={creating || !payrollPeriod.trim()}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 6,
                    border: 'none',
                    background: creating || !payrollPeriod.trim() ? 'var(--color-neutral-400)' : 'var(--color-primary-600)',
                    color: 'var(--color-text-inverse)',
                    cursor: creating || !payrollPeriod.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all var(--transition-normal)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!creating && payrollPeriod.trim()) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-700)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!creating && payrollPeriod.trim()) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
                    }
                  }}
                >
                  {creating && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                  {creating ? 'Creating...' : 'Create Payroll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default PayrollList;
