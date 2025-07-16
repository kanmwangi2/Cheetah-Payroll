import React, { useEffect, useState } from 'react';
import { getPayrolls, createComprehensivePayroll, deletePayroll } from '../services/payroll.service';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import { isPayrollPreparerOrHigher, isCompanyAdminOrHigher } from '../../../shared/constants/app.constants';
import PayrollImportExport from './PayrollImportExport';
import { BulkEmailSender } from '../../../shared/components/ui/EmailSender';
import { PayslipEmailData } from '../../../shared/services/email.service';
import Button from '../../../shared/components/ui/Button';

const PayrollList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { user } = useAuthContext();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [payrollPeriod, setPayrollPeriod] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [creating, setCreating] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    getPayrolls(companyId)
      .then(setPayrolls)
      .catch(e => setError(e.message || 'Failed to load payrolls'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  const handleCreatePayroll = async () => {
    if (!payrollPeriod.trim()) {
      setError('Please select a payroll period');
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
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create comprehensive payroll');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePayroll = async (payrollId: string, payrollPeriod: string) => {
    if (!confirm(`Are you sure you want to delete the payroll for ${payrollPeriod}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePayroll(companyId, payrollId);
      setRefresh(r => r + 1);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to delete payroll');
    }
  };

  // Helper function to check permissions
  const canEditPayroll = (payroll: any) => {
    // Can edit if payroll is not approved/processed
    return payroll.status === 'draft' || payroll.status === 'pending_approval';
  };

  const canDeletePayroll = (payroll: any) => {
    // Non-approved payrolls: can be deleted by payroll preparers/approvers
    if (payroll.status === 'draft' || payroll.status === 'pending_approval') {
      return user?.role && isPayrollPreparerOrHigher(user.role);
    }
    
    // Approved/processed payrolls: only admins can delete
    if (payroll.status === 'approved' || payroll.status === 'processed') {
      return user?.role && isCompanyAdminOrHigher(user.role);
    }
    
    return false;
  };

  // Email handling functions
  const handleEmailSuccess = (message?: string) => {
    setEmailSuccess(message || 'Email sent successfully!');
    setEmailError(null);
    setTimeout(() => setEmailSuccess(null), 5000);
  };

  const handleEmailError = (error: string) => {
    setEmailError(error);
    setEmailSuccess(null);
    setTimeout(() => setEmailError(null), 8000);
  };

  const createPayslipEmailData = (payroll: any): PayslipEmailData[] => {
    if (!payroll.details || !Array.isArray(payroll.details)) {
      return [];
    }

    return payroll.details
      .filter((detail: any) => detail.staffEmail) // Only include staff with email
      .map((detail: any) => ({
        staffId: detail.staffId,
        staffName: detail.staffName,
        staffEmail: detail.staffEmail,
        payrollPeriod: payroll.period,
        payslipData: {
          basicSalary: detail.basicSalary || 0,
          allowances: detail.allowances || {},
          deductions: detail.deductions || {},
          netSalary: detail.netSalary || 0,
          grossSalary: detail.grossSalary || 0
        }
      }));
  };

  const canSendEmails = (payroll: any) => {
    return payroll.status === 'approved' || payroll.status === 'processed';
  };

  if (loading) {return <div className="payroll-loading" aria-live="polite" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading payrolls...</div>;}
  if (error)
    {return (
      <div className="payroll-error" role="alert" aria-live="assertive" style={{ padding: '20px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error-text)', borderRadius: '8px', border: '1px solid var(--color-error-border)' }}>
        {error}
      </div>
    );}

  const filtered = payrolls.filter(p => p !== null).filter(p => {
    return !search || 
           (p?.period && p.period.toLowerCase().includes(search.toLowerCase())) ||
           String(p?.totalGrossPay || 0).includes(search) || 
           String(p?.totalNetPay || 0).includes(search) ||
           (p?.status && p.status.toLowerCase().includes(search.toLowerCase()));
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={() => setShowImportExport(true)}
            variant="primary"
            leftIcon="📤"
          >
            Import/Export
          </Button>
          
          {/* Bulk Email Button for Approved Payrolls */}
          {payrolls.filter(p => canSendEmails(p)).length > 0 && (
            <BulkEmailSender
              payslips={payrolls
                .filter(p => canSendEmails(p))
                .flatMap(p => createPayslipEmailData(p))
                .filter(data => data.staffEmail)}
              onSuccess={(result) => handleEmailSuccess(`Successfully sent ${result.sent} emails. ${result.failed > 0 ? `${result.failed} failed.` : ''}`)}
              onError={handleEmailError}
              disabled={payrolls.filter(p => canSendEmails(p)).length === 0}
            />
          )}
          
          <Button
            onClick={() => setShowPayrollForm(true)}
            variant="primary"
            leftIcon="+"
          >
            Create New Payroll
          </Button>
        </div>
      </div>


      {/* Email Success/Error Messages */}
      {emailSuccess && (
        <div style={{
          background: 'var(--color-success-bg)',
          color: 'var(--color-success-text)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--color-success-border)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          ✅ {emailSuccess}
        </div>
      )}
      
      {emailError && (
        <div style={{
          background: 'var(--color-error-bg)',
          color: 'var(--color-error-text)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--color-error-border)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          ❌ {emailError}
        </div>
      )}

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
              className="btn btn-ghost btn-xs"
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
                    Actions & Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const statusColor = p?.status === 'completed' ? 'var(--color-success-600)' : 
                                     p?.status === 'pending' ? 'var(--color-warning-600)' : 
                                     p?.status === 'draft' ? 'var(--color-info-600)' : 'var(--color-text-secondary)';
                  
                  return (
                    <tr key={p?.id || `payroll-${Math.random()}`} style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
                      <td style={{ padding: '16px', textAlign: 'left', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {p?.period || 'N/A'}
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
                          {p?.status || 'draft'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-primary)' }}>
                        {p?.staffCount || 0}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        RWF {p?.totalGrossPay?.toLocaleString() || '0'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: 'var(--color-success-600)' }}>
                        RWF {p?.totalNetPay?.toLocaleString() || '0'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        {p?.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div className="table-actions">
                          {canEditPayroll(p) && (
                            <button
                              onClick={() => alert('View/Edit payroll functionality not yet implemented')}
                              className="btn btn-warning btn-sm"
                            >
                              View/Edit
                            </button>
                          )}
                          {canSendEmails(p) && createPayslipEmailData(p).length > 0 && (
                            <BulkEmailSender
                              payslips={createPayslipEmailData(p)}
                              onSuccess={(result) => handleEmailSuccess(`Sent ${result.sent} payslips for ${p.period}. ${result.failed > 0 ? `${result.failed} failed.` : ''}`)}
                              onError={handleEmailError}
                              disabled={createPayslipEmailData(p).length === 0}
                            />
                          )}
                          {canDeletePayroll(p) && (
                            <button
                              onClick={() => handleDeletePayroll(p.id, p.period)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
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
          background: 'var(--color-bg-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-card-bg)',
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
              className="modal-close-btn"
            >
              ×
            </button>
            
            <h3 style={{ 
              margin: '0 0 24px 0', 
              color: 'var(--color-text-primary)',
              fontSize: '1.5rem',
              fontWeight: 600
            }}>
              Create New Payroll
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
                  type="month"
                  value={payrollPeriod}
                  onChange={e => setPayrollPeriod(e.target.value)}
                  min="2020-01"
                  max="2030-12"
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
                  Select the month and year for this payroll run. This will create a comprehensive payroll for all active staff members.
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

              <div className="btn-group justify-end" style={{ marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setShowPayrollForm(false);
                    setPayrollPeriod('');
                    setError(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePayroll}
                  disabled={creating || !payrollPeriod.trim()}
                  className="btn btn-primary"
                >
                  {creating && <div className="spinner" />}
                  {creating ? 'Creating...' : 'Create Payroll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowImportExport(false)}
              className="modal-close-btn"
            >
              ×
            </button>
            <PayrollImportExport 
              companyId={companyId} 
              payrolls={payrolls}
              onImported={() => {
                setShowImportExport(false);
                setRefresh(r => r + 1);
              }} 
            />
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
